using System.Security.Claims;
using ClubeDoAlbum.Api.Data;
using ClubeDoAlbum.Api.DTOs;
using ClubeDoAlbum.Api.Models.Entities;
using ClubeDoAlbum.Api.Models.Enums;
using ClubeDoAlbum.Api.Services.Spotify;
using ClubeDoAlbum.Api.Services.MusicBrainz;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubeDoAlbum.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlbumsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ISpotifyService _spotifyService;
    private readonly IMusicBrainzService _musicBrainzService;

    public AlbumsController(
        AppDbContext context,
        ISpotifyService spotifyService,
        IMusicBrainzService musicBrainzService)
    {
        _context = context;
        _spotifyService = spotifyService;
        _musicBrainzService = musicBrainzService;
    }

    /// <summary>
    /// Retorna a lista de álbuns (com suporte a filtros por status: 'Backlog', 'EmAvaliacao', 'Finalizado', edição e membro indicador).
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<AlbumResponseDto>>> GetAlbums(
        [FromQuery] string? status = null,
        [FromQuery] Guid? edicaoId = null,
        [FromQuery] Guid? userId = null)
    {
        var query = _context.Albums
            .Include(a => a.Edicao)
            .Include(a => a.IndicadoPorUser)
            .Include(a => a.Avaliacoes)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<AlbumStatus>(status, true, out var parsedStatus))
        {
            if (parsedStatus == AlbumStatus.EstaSemana && !edicaoId.HasValue)
            {
                var edicaoAtiva = await _context.Edicoes.FirstOrDefaultAsync(e => e.Status == Models.Enums.EdicaoStatus.EmAndamento);
                if (edicaoAtiva != null)
                {
                    query = query.Where(a => a.Status == AlbumStatus.EstaSemana && a.EdicaoId == edicaoAtiva.Id);
                }
                else
                {
                    query = query.Where(a => a.Status == AlbumStatus.EstaSemana && a.EdicaoId == null);
                }
            }
            else
            {
                query = query.Where(a => a.Status == parsedStatus);
            }
        }

        if (edicaoId.HasValue)
        {
            query = query.Where(a => a.EdicaoId == edicaoId.Value);
        }

        if (userId.HasValue)
        {
            query = query.Where(a => a.IndicadoPorUserId == userId.Value);
        }


        Guid? currentUserId = null;
        var claimUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(claimUserId, out var parsedUserId))
        {
            currentUserId = parsedUserId;
        }

        var albums = await query
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AlbumResponseDto
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
                TotalAvaliacoes = a.Avaliacoes.Count,
                CreatedAt = a.CreatedAt,
                EdicaoId = a.EdicaoId,
                EdicaoTema = a.Edicao != null ? a.Edicao.Tema : null,
                MinhaNota = currentUserId.HasValue
                    ? a.Avaliacoes.Where(av => av.UserId == currentUserId.Value).Select(av => (decimal?)av.Nota).FirstOrDefault()
                    : null,
                IndicadoPor = a.IndicadoPorUser != null ? new UserDto
                {
                    Id = a.IndicadoPorUser.Id,
                    Nome = a.IndicadoPorUser.Nome,
                    Email = a.IndicadoPorUser.Email,
                    AvatarUrl = a.IndicadoPorUser.AvatarUrl,
                    IsAdmin = a.IndicadoPorUser.IsAdmin
                } : null
            })
            .ToListAsync();

        return Ok(albums);
    }

    /// <summary>
    /// Retorna os detalhes de um álbum específico, incluindo todas as notas e comentários dos membros.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AlbumDetailDto>> GetAlbumById(Guid id)
    {
        var album = await _context.Albums
            .Include(a => a.Edicao)
            .Include(a => a.IndicadoPorUser)
            .Include(a => a.Avaliacoes)
                .ThenInclude(av => av.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);

        if (album == null)
        {
            return NotFound(new { message = "Álbum não encontrado." });
        }

        var dto = new AlbumDetailDto
        {
            Id = album.Id,
            Titulo = album.Titulo,
            Artista = album.Artista,
            AnoLancamento = album.AnoLancamento,
            CapaUrl = album.CapaUrl,
            SpotifyUrl = album.SpotifyUrl,
            SpotifyId = album.SpotifyId,
            PaisOrigem = album.PaisOrigem,
            Status = album.Status.ToString(),
            NotaMedia = album.NotaMedia,
            TotalAvaliacoes = album.Avaliacoes.Count,
            CreatedAt = album.CreatedAt,
            EdicaoId = album.EdicaoId,
            EdicaoTema = album.Edicao?.Tema,
            IndicadoPor = album.IndicadoPorUser != null ? new UserDto
            {
                Id = album.IndicadoPorUser.Id,
                Nome = album.IndicadoPorUser.Nome,
                Email = album.IndicadoPorUser.Email,
                AvatarUrl = album.IndicadoPorUser.AvatarUrl,
                IsAdmin = album.IndicadoPorUser.IsAdmin
            } : null,
            Avaliacoes = album.Avaliacoes
                .OrderByDescending(av => av.CreatedAt)
                .Select(av => new ReviewResponseDto
                {
                    Id = av.Id,
                    AlbumId = av.AlbumId,
                    Nota = av.Nota,
                    Comentario = av.Comentario,
                    CreatedAt = av.CreatedAt,
                    UpdatedAt = av.UpdatedAt,
                    Usuario = new UserDto
                    {
                        Id = av.User.Id,
                        Nome = av.User.Nome,
                        Email = av.User.Email,
                        AvatarUrl = av.User.AvatarUrl,
                        IsAdmin = av.User.IsAdmin
                    }
                })
                .ToList()
        };

        if (Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var currentAuthUserId))
        {
            dto.MinhaNota = album.Avaliacoes.FirstOrDefault(av => av.UserId == currentAuthUserId)?.Nota;
        }

        // 1. Se ainda não tem país de origem cadastrado, resolve via MusicBrainz e salva no banco
        if (string.IsNullOrWhiteSpace(dto.PaisOrigem) && !string.IsNullOrWhiteSpace(album.Artista))
        {
            var country = await _musicBrainzService.ObterPaisOrigemArtistaAsync(album.Artista);
            if (!string.IsNullOrWhiteSpace(country))
            {
                dto.PaisOrigem = country;
                var albumDb = await _context.Albums.FindAsync(id);
                if (albumDb != null)
                {
                    albumDb.PaisOrigem = country;
                    await _context.SaveChangesAsync();
                }
            }
        }

        // 2. Busca lista de faixas do Spotify sob demanda (com cache em memória de 24h)
        if (!string.IsNullOrWhiteSpace(album.SpotifyId))
        {
            dto.Faixas = await _spotifyService.GetAlbumTracksAsync(album.SpotifyId);
        }

        return Ok(dto);
    }

    /// <summary>
    /// Adiciona um novo álbum. Se informado o link ou nome no campo 'SpotifyInput', busca e preenche tudo automaticamente!
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AlbumResponseDto>> CreateAlbum([FromBody] CreateAlbumDto request)
    {
        string titulo = request.Titulo?.Trim() ?? string.Empty;
        string artista = request.Artista?.Trim() ?? string.Empty;
        int ano = request.AnoLancamento ?? 0;
        string? capaUrl = request.CapaUrl?.Trim();
        string? spotifyUrl = request.SpotifyUrl?.Trim();
        string? spotifyId = request.SpotifyId?.Trim();

        // 1. Se informou um input de busca ou link do Spotify, preenche automaticamente via API do Spotify
        if (!string.IsNullOrWhiteSpace(request.SpotifyInput))
        {
            var spotifyAlbum = await _spotifyService.ResolveAlbumAsync(request.SpotifyInput);
            if (spotifyAlbum == null && string.IsNullOrWhiteSpace(titulo))
            {
                return NotFound(new { message = $"Nenhum álbum foi encontrado no Spotify com a busca '{request.SpotifyInput}'. Verifique a digitação ou utilize o link direto do Spotify." });
            }

            if (spotifyAlbum != null)
            {
                titulo = string.IsNullOrWhiteSpace(titulo) ? spotifyAlbum.Titulo : titulo;
                artista = string.IsNullOrWhiteSpace(artista) ? spotifyAlbum.Artista : artista;
                ano = ano == 0 ? spotifyAlbum.AnoLancamento : ano;
                capaUrl = string.IsNullOrWhiteSpace(capaUrl) ? spotifyAlbum.CapaUrl : capaUrl;
                spotifyUrl = string.IsNullOrWhiteSpace(spotifyUrl) ? spotifyAlbum.SpotifyUrl : spotifyUrl;
                spotifyId = string.IsNullOrWhiteSpace(spotifyId) ? spotifyAlbum.SpotifyId : spotifyId;
            }
        }

        if (string.IsNullOrWhiteSpace(titulo) || string.IsNullOrWhiteSpace(artista))
        {
            return BadRequest(new { message = "Título e Artista são obrigatórios (ou informe um SpotifyInput válido para busca automática)." });
        }

        // 2. Previne que o mesmo álbum seja cadastrado duas vezes no clube
        var albumDuplicado = await _context.Albums
            .Include(a => a.IndicadoPorUser)
            .FirstOrDefaultAsync(a =>
                (!string.IsNullOrEmpty(spotifyId) && a.SpotifyId == spotifyId) ||
                (a.Titulo.ToLower() == titulo.ToLower() && a.Artista.ToLower() == artista.ToLower())
            );

        if (albumDuplicado != null)
        {
            var indicadoPor = albumDuplicado.IndicadoPorUser != null
                ? $" por {albumDuplicado.IndicadoPorUser.Nome}"
                : "";
            return Conflict(new { message = $"O álbum '{albumDuplicado.Titulo}' de '{albumDuplicado.Artista}' já foi cadastrado anteriormente no clube{indicadoPor} (Status atual: {albumDuplicado.Status})." });
        }


        // 2. Determina quem indicou o álbum (via token JWT ou ID informado no request)
        Guid? indicadoPorId = request.IndicadoPorUserId;
        var claimUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(claimUserId, out var authUserId))
        {
            indicadoPorId = authUserId;
        }

        var statusInicial = AlbumStatus.EstaSemana;
        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<AlbumStatus>(request.Status, true, out var statusInformado))
        {
            statusInicial = statusInformado;
        }

        Guid? edicaoId = request.EdicaoId;
        string? edicaoTema = null;

        // Se for cadastrar para EstaSemana:
        if (statusInicial == AlbumStatus.EstaSemana)
        {
            var edicaoAtiva = await _context.Edicoes.FirstOrDefaultAsync(e => e.Status == Models.Enums.EdicaoStatus.EmAndamento);
            if (!edicaoId.HasValue && edicaoAtiva != null)
            {
                edicaoId = edicaoAtiva.Id;
                edicaoTema = edicaoAtiva.Tema;
            }

            // Valida regra do clube: Limite de até 2 álbuns por membro por semana/edição
            if (indicadoPorId.HasValue)
            {
                int countJaIndicados;
                if (edicaoAtiva != null)
                {
                    countJaIndicados = await _context.Albums.CountAsync(a =>
                        a.IndicadoPorUserId == indicadoPorId.Value &&
                        a.EdicaoId == edicaoAtiva.Id &&
                        a.Status == AlbumStatus.EstaSemana);
                }
                else
                {
                    countJaIndicados = await _context.Albums.CountAsync(a =>
                        a.IndicadoPorUserId == indicadoPorId.Value &&
                        a.Status == AlbumStatus.EstaSemana &&
                        a.EdicaoId == null);
                }

                if (countJaIndicados >= 2)
                {
                    var userIndicador = await _context.Users.FindAsync(indicadoPorId.Value);
                    var nomeUser = userIndicador?.Nome ?? "Este membro";
                    return BadRequest(new { message = $"{nomeUser} já atingiu o limite de 2 indicações para esta semana temática (Máximo: 2 álbuns por membro)." });
                }
            }
        }
        else if (edicaoId.HasValue)
        {
            var ed = await _context.Edicoes.FindAsync(edicaoId.Value);
            edicaoTema = ed?.Tema;
        }

        string? paisOrigem = request.PaisOrigem?.Trim()?.ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(paisOrigem) && !string.IsNullOrWhiteSpace(artista))
        {
            paisOrigem = await _musicBrainzService.ObterPaisOrigemArtistaAsync(artista);
        }

        var album = new Album
        {
            Titulo = titulo,
            Artista = artista,
            AnoLancamento = ano,
            CapaUrl = capaUrl,
            SpotifyUrl = spotifyUrl,
            SpotifyId = spotifyId,
            PaisOrigem = paisOrigem,
            Status = statusInicial,
            EdicaoId = edicaoId,
            IndicadoPorUserId = indicadoPorId,
            NotaMedia = 0m,
            CreatedAt = DateTime.UtcNow
        };

        _context.Albums.Add(album);
        await _context.SaveChangesAsync();

        UserDto? indicadoPorDto = null;
        if (indicadoPorId.HasValue)
        {
            var user = await _context.Users.FindAsync(indicadoPorId.Value);
            if (user != null)
            {
                indicadoPorDto = new UserDto
                {
                    Id = user.Id,
                    Nome = user.Nome,
                    Email = user.Email,
                    AvatarUrl = user.AvatarUrl,
                    IsAdmin = user.IsAdmin
                };
            }
        }

        return CreatedAtAction(nameof(GetAlbumById), new { id = album.Id }, new AlbumResponseDto
        {
            Id = album.Id,
            Titulo = album.Titulo,
            Artista = album.Artista,
            AnoLancamento = album.AnoLancamento,
            CapaUrl = album.CapaUrl,
            SpotifyUrl = album.SpotifyUrl,
            SpotifyId = album.SpotifyId,
            PaisOrigem = album.PaisOrigem,
            Status = album.Status.ToString(),
            NotaMedia = album.NotaMedia,
            TotalAvaliacoes = 0,
            CreatedAt = album.CreatedAt,
            EdicaoId = album.EdicaoId,
            EdicaoTema = edicaoTema,
            IndicadoPor = indicadoPorDto
        });
    }

    /// <summary>
    /// Altera o status do álbum (ex: de 'EstaSemana' para 'JaOuvido').
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateAlbumStatusDto request)
    {
        if (!Enum.TryParse<AlbumStatus>(request.Status, true, out var novoStatus))
        {
            return BadRequest(new { message = "Status inválido. Use 'EstaSemana' ou 'JaOuvido'." });
        }

        var album = await _context.Albums.FindAsync(id);
        if (album == null)
        {
            return NotFound(new { message = "Álbum não encontrado." });
        }

        album.Status = novoStatus;
        if (request.EdicaoId.HasValue)
        {
            album.EdicaoId = request.EdicaoId.Value;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = $"Status do álbum atualizado para {novoStatus} com sucesso." });
    }

    /// <summary>
    /// Remove um álbum do sistema.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAlbum(Guid id)
    {
        var album = await _context.Albums.FindAsync(id);
        if (album == null)
        {
            return NotFound(new { message = "Álbum não encontrado." });
        }

        _context.Albums.Remove(album);
        await _context.SaveChangesAsync();
        return NoContent();
    }

}
