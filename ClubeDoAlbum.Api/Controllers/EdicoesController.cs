using System.Security.Claims;
using ClubeDoAlbum.Api.Common;
using ClubeDoAlbum.Api.Data;
using ClubeDoAlbum.Api.DTOs;
using ClubeDoAlbum.Api.Models.Entities;
using ClubeDoAlbum.Api.Models.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubeDoAlbum.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EdicoesController : ControllerBase
{
    private readonly AppDbContext _context;

    public EdicoesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lista todas as edições/semanas cadastradas no clube, com seus respectivos álbuns e notas.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<EdicaoResponseDto>>> GetAllEdicoes()
    {
        var edicoes = await _context.Edicoes
            .Include(e => e.Albuns)
                .ThenInclude(a => a.IndicadoPorUser)
            .Include(e => e.Albuns)
                .ThenInclude(a => a.Avaliacoes)
            .OrderByDescending(e => e.Numero)
            .ThenByDescending(e => e.CreatedAt)
            .ToListAsync();

        var currentUserId = GetCurrentUserId();
        var resultado = edicoes.Select(e => MapToEdicaoResponseDto(e, currentUserId)).ToList();
        return Ok(resultado);
    }

    /// <summary>
    /// Retorna a edição/semana atualmente em andamento (ativa).
    /// </summary>
    [HttpGet("ativa")]
    public async Task<ActionResult<EdicaoResponseDto?>> GetEdicaoAtiva()
    {
        var edicaoAtiva = await _context.Edicoes
            .Include(e => e.Albuns)
                .ThenInclude(a => a.IndicadoPorUser)
            .Include(e => e.Albuns)
                .ThenInclude(a => a.Avaliacoes)
            .FirstOrDefaultAsync(e => e.Status == EdicaoStatus.EmAndamento);

        if (edicaoAtiva == null)
        {
            return Ok(null);
        }

        return Ok(MapToEdicaoResponseDto(edicaoAtiva, GetCurrentUserId()));
    }

    /// <summary>
    /// Retorna o status de indicações de cada membro para a semana ativa (ex: quem já indicou 2 álbuns, quem indicou 1, quem não indicou nenhum).
    /// </summary>
    [HttpGet("ativa/membros-status")]
    public async Task<ActionResult<List<MembroIndicacoesStatusDto>>> GetMembrosStatusSemanaAtiva()
    {
        var edicaoAtiva = await _context.Edicoes
            .FirstOrDefaultAsync(e => e.Status == EdicaoStatus.EmAndamento);

        var users = await _context.Users
            .OrderBy(u => u.Nome)
            .ToListAsync();

        List<Album> albunsSemana;
        if (edicaoAtiva != null)
        {
            // Apenas os álbuns vinculados à edição ativa contam para a cota da semana ativa
            albunsSemana = await _context.Albums
                .Where(a => a.EdicaoId == edicaoAtiva.Id && a.Status == AlbumStatus.EstaSemana)
                .ToListAsync();
        }
        else
        {
            albunsSemana = await _context.Albums
                .Where(a => a.Status == AlbumStatus.EstaSemana && a.EdicaoId == null)
                .ToListAsync();
        }

        var status = users.Select(u =>
        {
            var indicados = albunsSemana.Where(a => a.IndicadoPorUserId == u.Id).ToList();
            return new MembroIndicacoesStatusDto
            {
                UserId = u.Id,
                Nome = u.Nome,
                AvatarUrl = u.AvatarUrl,
                TotalIndicados = indicados.Count,
                LimiteMaximo = 1,
                AlbunsIndicadosTitulos = indicados.Select(a => $"{a.Titulo} ({a.Artista})").ToList()
            };
        }).ToList();

        return Ok(status);
    }

    /// <summary>
    /// Retorna uma edição específica com todos os seus álbuns.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EdicaoResponseDto>> GetEdicaoById(Guid id)
    {
        var edicao = await _context.Edicoes
            .Include(e => e.Albuns)
                .ThenInclude(a => a.IndicadoPorUser)
            .Include(e => e.Albuns)
                .ThenInclude(a => a.Avaliacoes)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (edicao == null)
        {
            return NotFound(new { message = "Edição não encontrada." });
        }

        return Ok(MapToEdicaoResponseDto(edicao, GetCurrentUserId()));
    }

    /// <summary>
    /// Cadastra uma nova edição / semana temática (ex: "Semana do Metal Progressivo").
    /// Se AtivarImediatamente for true, encerra a semana anterior e inicia esta como ativa.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<EdicaoResponseDto>> CreateEdicao([FromBody] CreateEdicaoDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Tema))
        {
            return BadRequest(new { message = "O tema da semana é obrigatório." });
        }

        // Calcula número automático se não informado
        int numero = request.Numero ?? ((await _context.Edicoes.MaxAsync(e => (int?)e.Numero) ?? 0) + 1);

        var edicao = new Edicao
        {
            Numero = numero,
            Tema = request.Tema.Trim(),
            Descricao = request.Descricao?.Trim(),
            DataReuniao = request.DataReuniao,
            Status = request.AtivarImediatamente ? EdicaoStatus.EmAndamento : EdicaoStatus.Planejada,
            CreatedAt = DateTime.UtcNow
        };

        _context.Edicoes.Add(edicao);
        await _context.SaveChangesAsync();

        // Se for ativar imediatamente, finaliza a semana anterior e garante que álbuns de semanas passadas passem a JaOuvido
        if (request.AtivarImediatamente)
        {
            var edicoesAtivasAnteriores = await _context.Edicoes
                .Where(e => e.Id != edicao.Id && e.Status == EdicaoStatus.EmAndamento)
                .ToListAsync();

            foreach (var anterior in edicoesAtivasAnteriores)
            {
                anterior.Status = EdicaoStatus.Finalizada;
            }

            // Garante que TODOS os álbuns vinculados a edições anteriores sejam marcados como JaOuvido
            var albunsDeSemanasPassadas = await _context.Albums
                .Where(a => a.EdicaoId != null && a.EdicaoId != edicao.Id && a.Status == AlbumStatus.EstaSemana)
                .ToListAsync();

            foreach (var alb in albunsDeSemanasPassadas)
            {
                alb.Status = AlbumStatus.JaOuvido;
            }

            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetEdicaoById), new { id = edicao.Id }, MapToEdicaoResponseDto(edicao, GetCurrentUserId()));
    }

    /// <summary>
    /// Encerra a semana temática atual, marcando a edição como Finalizada e todos os álbuns dela como JaOuvido.
    /// </summary>
    [HttpPost("{id:guid}/encerrar")]
    public async Task<ActionResult<EdicaoResponseDto>> EncerrarEdicao(Guid id)
    {
        var edicao = await _context.Edicoes
            .Include(e => e.Albuns)
                .ThenInclude(a => a.IndicadoPorUser)
            .Include(e => e.Albuns)
                .ThenInclude(a => a.Avaliacoes)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (edicao == null)
        {
            return NotFound(new { message = "Edição não encontrada." });
        }

        edicao.Status = EdicaoStatus.Finalizada;

        // Passa todos os álbuns desta edição para JaOuvido
        foreach (var alb in edicao.Albuns)
        {
            alb.Status = AlbumStatus.JaOuvido;
        }

        await _context.SaveChangesAsync();
        return Ok(MapToEdicaoResponseDto(edicao, GetCurrentUserId()));
    }

    /// <summary>
    /// Ativa uma edição existente como a semana em andamento.
    /// </summary>
    [HttpPost("{id:guid}/ativar")]
    public async Task<ActionResult<EdicaoResponseDto>> AtivarEdicao(Guid id)
    {
        var edicao = await _context.Edicoes
            .Include(e => e.Albuns)
                .ThenInclude(a => a.IndicadoPorUser)
            .Include(e => e.Albuns)
                .ThenInclude(a => a.Avaliacoes)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (edicao == null)
        {
            return NotFound(new { message = "Edição não encontrada." });
        }

        // Finaliza outras edições ativas e passa seus álbuns para JaOuvido
        var outrasAtivas = await _context.Edicoes
            .Where(e => e.Id != id && e.Status == EdicaoStatus.EmAndamento)
            .ToListAsync();

        foreach (var anterior in outrasAtivas)
        {
            anterior.Status = EdicaoStatus.Finalizada;
        }

        var albunsOutras = await _context.Albums
            .Where(a => a.EdicaoId != null && a.EdicaoId != id && a.Status == AlbumStatus.EstaSemana)
            .ToListAsync();

        foreach (var alb in albunsOutras)
        {
            alb.Status = AlbumStatus.JaOuvido;
        }

        edicao.Status = EdicaoStatus.EmAndamento;
        foreach (var alb in edicao.Albuns)
        {
            alb.Status = AlbumStatus.EstaSemana;
        }

        await _context.SaveChangesAsync();
        return Ok(MapToEdicaoResponseDto(edicao, GetCurrentUserId()));
    }

    /// <summary>
    /// Atualiza exclusivamente a data da reunião de uma edição, sem alterar tema, status ou álbuns vinculados.
    /// Apenas administradores do clube podem alterar a data da reunião.
    /// </summary>
    [HttpPatch("{id:guid}/data-reuniao")]
    public async Task<ActionResult<EdicaoResponseDto>> AtualizarDataReuniao(Guid id, [FromBody] AtualizarDataReuniaoDto request)
    {
        var claimUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(claimUserId, out var userId))
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.IsAdmin)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = "Apenas administradores podem alterar a data da reunião." });
            }
        }
        else if (!User.IsInRole("Admin"))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Apenas administradores podem alterar a data da reunião." });
        }

        var edicao = await _context.Edicoes
            .Include(e => e.Albuns)
                .ThenInclude(a => a.IndicadoPorUser)
            .Include(e => e.Albuns)
                .ThenInclude(a => a.Avaliacoes)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (edicao == null)
        {
            return NotFound(new { message = "Edição não encontrada." });
        }

        edicao.DataReuniao = request.DataReuniao;
        await _context.SaveChangesAsync();

        return Ok(MapToEdicaoResponseDto(edicao, GetCurrentUserId()));
    }

    /// <summary>
    /// Exclui uma edição pelo ID. Apenas administradores do clube podem excluir uma edição.
    /// Se houver álbuns vinculados que pertencem unicamente a esta edição, eles e suas avaliações são removidos em cascata.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteEdicao(Guid id)
    {
        var claimUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(claimUserId, out var userId))
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.IsAdmin)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = "Apenas administradores podem excluir uma edição." });
            }
        }
        else if (!User.IsInRole("Admin"))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Apenas administradores podem excluir uma edição." });
        }

        var edicao = await _context.Edicoes
            .Include(e => e.Albuns)
                .ThenInclude(a => a.Avaliacoes)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (edicao == null)
        {
            return NotFound(new { message = "Edição não encontrada." });
        }

        if (edicao.Albuns.Count > 0)
        {
            _context.Albums.RemoveRange(edicao.Albuns);
        }

        _context.Edicoes.Remove(edicao);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private Guid? GetCurrentUserId()
    {
        var claimUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claimUserId, out var userId) ? userId : null;
    }

    private static EdicaoResponseDto MapToEdicaoResponseDto(Edicao e, Guid? currentUserId = null)
    {
        var albuns = e.Albuns.Select(a =>
        {
            decimal? minhaNota = currentUserId.HasValue
                ? a.Avaliacoes?.FirstOrDefault(av => av.UserId == currentUserId.Value)?.Nota
                : null;

            return new AlbumResponseDto
            {
                Id = a.Id,
                Titulo = a.Titulo,
                Artista = a.Artista,
                AnoLancamento = a.AnoLancamento,
                CapaUrl = a.CapaUrl,
                SpotifyUrl = a.SpotifyUrl,
                SpotifyId = a.SpotifyId,
                PaisOrigem = a.PaisOrigem,
                Status = a.Status.ToString(),
                NotaMedia = a.NotaMedia,
                TotalAvaliacoes = a.Avaliacoes?.Count ?? 0,
                CreatedAt = a.CreatedAt,
                EdicaoId = a.EdicaoId,
                EdicaoTema = e.Tema,
                MinhaNota = minhaNota,
                IndicadoPor = a.IndicadoPorUser != null ? new UserDto
                {
                    Id = a.IndicadoPorUser.Id,
                    Nome = a.IndicadoPorUser.Nome,
                    Email = a.IndicadoPorUser.Email,
                    AvatarUrl = a.IndicadoPorUser.AvatarUrl,
                    IsAdmin = a.IndicadoPorUser.IsAdmin
                } : null
            };
        }).OrderByDescending(a => a.NotaMedia).ToList();

        decimal? mediaGeral = albuns.Any(a => a.NotaMedia > 0)
            ? Math.Round(albuns.Where(a => a.NotaMedia > 0).Average(a => a.NotaMedia), 1)
            : null;

        return new EdicaoResponseDto
        {
            Id = e.Id,
            Numero = e.Numero,
            Tema = e.Tema,
            Descricao = e.Descricao,
            DataReuniao = e.DataReuniao,
            Status = e.Status.ToString(),
            CreatedAt = e.CreatedAt,
            TotalAlbuns = albuns.Count,
            NotaMediaGeral = mediaGeral,
            Albuns = albuns
        };
    }
}
