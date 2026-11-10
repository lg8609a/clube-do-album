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
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Registra ou atualiza a nota (0-10) e o comentário de um amigo sobre um disco específico.
    /// Recalcula automaticamente a média do álbum.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ReviewResponseDto>> CreateOrUpdateReview([FromBody] CreateReviewDto request)
    {
        if (request.Nota < 0m || request.Nota > 10m)
        {
            return BadRequest(new { message = "A nota deve estar entre 0.0 e 10.0." });
        }

        var album = await _context.Albums
            .Include(a => a.Edicao)
            .FirstOrDefaultAsync(a => a.Id == request.AlbumId);

        if (album == null)
        {
            return NotFound(new { message = "Álbum não encontrado." });
        }

        // Determina o usuário (via JWT autenticado ou informado no body)
        Guid userId;
        var claimUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(claimUserId, out var authUserId))
        {
            userId = authUserId;
        }
        else if (request.UserId.HasValue)
        {
            userId = request.UserId.Value;
        }
        else
        {
            return BadRequest(new { message = "É necessário informar o 'UserId' ou estar autenticado com token JWT." });
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Usuário não encontrado." });
        }

        // Determina se o usuário chamador possui privilégios de administrador (bypass)
        bool isCallerAdmin = false;
        if (Guid.TryParse(claimUserId, out var callerId))
        {
            var caller = await _context.Users.FindAsync(callerId);
            if (caller?.IsAdmin == true)
            {
                isCallerAdmin = true;
            }
        }
        else if (user.IsAdmin)
        {
            isCallerAdmin = true;
        }

        // Regra de Negócio - Lock de Avaliações em Semanas Encerradas:
        // 1. Se a semana já foi encerrada (album.Status == JaOuvido ou Edicao.Status == Finalizada):
        //    - Membros que JÁ AVALIARAM não podem mais alterar a nota ou comentário (403 Forbidden).
        //    - Membros que NÃO AVALIARAM têm UMA CHANCE ÚNICA retroativa de registrar sua nota (review == null).
        // 2. Administradores têm bypass para efetuar correções em notas seladas.
        bool semanaEncerrada = album.Status == AlbumStatus.JaOuvido || (album.Edicao != null && album.Edicao.Status == EdicaoStatus.Finalizada);

        // Verifica se o usuário já avaliou este álbum anteriormente (Upsert)
        var review = await _context.Avaliacoes
            .FirstOrDefaultAsync(av => av.AlbumId == request.AlbumId && av.UserId == userId);

        if (semanaEncerrada && review != null && !isCallerAdmin)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "Esta semana temática já foi encerrada. As avaliações registradas estão seladas no histórico oficial do clube e não podem mais ser alteradas."
            });
        }

        if (review != null)
        {
            // Atualiza avaliação existente
            review.Nota = Math.Round(request.Nota, 1);
            review.Comentario = request.Comentario?.Trim();
            review.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            // Cria nova avaliação
            review = new Avaliacao
            {
                AlbumId = request.AlbumId,
                UserId = userId,
                Nota = Math.Round(request.Nota, 1),
                Comentario = request.Comentario?.Trim(),
                CreatedAt = DateTime.UtcNow
            };
            _context.Avaliacoes.Add(review);
        }

        await _context.SaveChangesAsync();

        // Recalcula e sincroniza a média ponderada do álbum
        // Regra de Negócio: Notas do curador para o álbum que ele mesmo indicou têm peso 0.5 (metade).
        // Notas dos demais membros têm peso normal 1.0.
        var avaliacoesAlbum = await _context.Avaliacoes
            .Where(av => av.AlbumId == request.AlbumId)
            .Select(av => new { av.UserId, av.Nota })
            .ToListAsync();

        album.NotaMedia = CalculoNotaHelper.CalcularMediaPonderada(
            avaliacoesAlbum.Select(av => (av.UserId, av.Nota)),
            album.IndicadoPorUserId
        );
        await _context.SaveChangesAsync();

        return Ok(new ReviewResponseDto
        {
            Id = review.Id,
            AlbumId = review.AlbumId,
            Nota = review.Nota,
            Comentario = review.Comentario,
            CreatedAt = review.CreatedAt,
            UpdatedAt = review.UpdatedAt,
            Usuario = new UserDto
            {
                Id = user.Id,
                Nome = user.Nome,
                Email = user.Email,
                AvatarUrl = user.AvatarUrl,
                IsAdmin = user.IsAdmin
            }
        });
    }

    /// <summary>
    /// Retorna todas as avaliações de um álbum.
    /// </summary>
    [HttpGet("album/{albumId:guid}")]
    public async Task<ActionResult<List<ReviewResponseDto>>> GetReviewsByAlbum(Guid albumId)
    {
        var reviews = await _context.Avaliacoes
            .Where(av => av.AlbumId == albumId)
            .Include(av => av.User)
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
            .ToListAsync();

        return Ok(reviews);
    }

    /// <summary>
    /// Retorna todas as avaliações feitas por um usuário específico, acompanhadas das informações do álbum.
    /// </summary>
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<List<UserReviewDetailDto>>> GetReviewsByUser(Guid userId)
    {
        var reviews = await _context.Avaliacoes
            .Where(av => av.UserId == userId)
            .Include(av => av.Album)
                .ThenInclude(a => a.Edicao)
            .OrderByDescending(av => av.CreatedAt)
            .Select(av => new UserReviewDetailDto
            {
                Id = av.Id,
                AlbumId = av.AlbumId,
                AlbumTitulo = av.Album.Titulo,
                AlbumArtista = av.Album.Artista,
                AlbumAnoLancamento = av.Album.AnoLancamento,
                AlbumCapaUrl = av.Album.CapaUrl,
                AlbumSpotifyUrl = av.Album.SpotifyUrl,
                AlbumNotaMedia = av.Album.NotaMedia,
                AlbumClassificacao = ClassificacaoNotaHelper.ObterClassificacao(av.Album.NotaMedia),
                AlbumStatus = (av.Album.Status == AlbumStatus.JaOuvido || (av.Album.Edicao != null && av.Album.Edicao.Status == EdicaoStatus.Finalizada))
                    ? AlbumStatus.JaOuvido.ToString()
                    : av.Album.Status.ToString(),
                Nota = av.Nota,
                Comentario = av.Comentario,
                CreatedAt = av.CreatedAt,
                UpdatedAt = av.UpdatedAt
            })
            .ToListAsync();

        return Ok(reviews);
    }
}
