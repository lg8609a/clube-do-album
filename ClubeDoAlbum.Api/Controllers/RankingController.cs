using ClubeDoAlbum.Api.Data;
using ClubeDoAlbum.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubeDoAlbum.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RankingController : ControllerBase
{
    private readonly AppDbContext _context;

    public RankingController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Retorna o grande ranking geral de notas dos álbuns, ordenados da maior média para a menor.
    /// Inclui quantidade de avaliações, quem indicou e os melhores comentários de destaque.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<RankingItemDto>>> GetRanking([FromQuery] bool apenasAvaliados = true)
    {
        var query = _context.Albums
            .Include(a => a.Edicao)
            .Include(a => a.IndicadoPorUser)
            .Include(a => a.Avaliacoes)
                .ThenInclude(av => av.User)
            .AsNoTracking()
            .AsQueryable();

        // Por padrão, exibe apenas os álbuns que já receberam ao menos uma nota
        if (apenasAvaliados)
        {
            query = query.Where(a => a.Avaliacoes.Any());
        }

        var albums = await query.ToListAsync();

        // Ordenação por maior média, com desempate por quantidade de notas e título
        var orderedAlbums = albums
            .OrderByDescending(a => a.NotaMedia)
            .ThenByDescending(a => a.Avaliacoes.Count)
            .ThenBy(a => a.Titulo)
            .ToList();

        int posicao = 1;
        var ranking = orderedAlbums.Select(a => new RankingItemDto
        {
            Posicao = posicao++,
            AlbumId = a.Id,
            Titulo = a.Titulo,
            Artista = a.Artista,
            AnoLancamento = a.AnoLancamento,
            CapaUrl = a.CapaUrl,
            SpotifyUrl = a.SpotifyUrl,
            NotaMedia = a.NotaMedia,
            TotalAvaliacoes = a.Avaliacoes.Count,
            EdicaoTema = a.Edicao?.Tema,
            IndicadoPorNome = a.IndicadoPorUser?.Nome,
            ComentariosDestaque = a.Avaliacoes
                .Where(av => !string.IsNullOrWhiteSpace(av.Comentario))
                .OrderByDescending(av => av.Nota)
                .Take(2)
                .Select(av => new TopCommentDto
                {
                    NomeUsuario = av.User.Nome,
                    AvatarUrl = av.User.AvatarUrl,
                    Nota = av.Nota,
                    Comentario = av.Comentario!
                })
                .ToList()
        }).ToList();

        return Ok(ranking);
    }

    /// <summary>
    /// Retorna o ranking de curadoria dos membros (quem indicou os álbuns com maior ou menor média no clube).
    /// Parâmetro 'ordem': 'desc' (maior média - melhor curador) ou 'asc' (menor média).
    /// </summary>
    [HttpGet("curators")]
    public async Task<ActionResult<List<CuratorRankingDto>>> GetCuratorRanking([FromQuery] string ordem = "desc")
    {
        var users = await _context.Users
            .Include(u => u.AlbunsIndicados)
                .ThenInclude(a => a.Avaliacoes)
            .AsNoTracking()
            .ToListAsync();

        var curatorStats = users.Select(u =>
        {
            var albunsAvaliados = u.AlbunsIndicados
                .Where(a => a.Avaliacoes.Any())
                .ToList();

            decimal mediaGeral = albunsAvaliados.Count > 0
                ? Math.Round(albunsAvaliados.Average(a => a.NotaMedia), 1)
                : 0m;

            var melhorAlbum = albunsAvaliados
                .OrderByDescending(a => a.NotaMedia)
                .Select(a => new BestWorstAlbumDto
                {
                    AlbumId = a.Id,
                    Titulo = a.Titulo,
                    Artista = a.Artista,
                    CapaUrl = a.CapaUrl,
                    NotaMedia = a.NotaMedia
                })
                .FirstOrDefault();

            var piorAlbum = albunsAvaliados
                .OrderBy(a => a.NotaMedia)
                .Select(a => new BestWorstAlbumDto
                {
                    AlbumId = a.Id,
                    Titulo = a.Titulo,
                    Artista = a.Artista,
                    CapaUrl = a.CapaUrl,
                    NotaMedia = a.NotaMedia
                })
                .FirstOrDefault();

            return new CuratorRankingDto
            {
                UserId = u.Id,
                Nome = u.Nome,
                AvatarUrl = u.AvatarUrl,
                TotalAlbunsIndicados = u.AlbunsIndicados.Count,
                TotalAlbunsAvaliados = albunsAvaliados.Count,
                MediaDasIndicacoes = mediaGeral,
                MelhorAlbumIndicado = melhorAlbum,
                PiorAlbumIndicado = piorAlbum
            };
        })
        .Where(c => c.TotalAlbunsAvaliados > 0)
        .ToList();

        // Ordenação por maior (desc) ou menor média (asc)
        bool isAsc = ordem.Trim().ToLower() == "asc";
        var sorted = isAsc
            ? curatorStats.OrderBy(c => c.MediaDasIndicacoes).ThenBy(c => c.TotalAlbunsAvaliados).ToList()
            : curatorStats.OrderByDescending(c => c.MediaDasIndicacoes).ThenByDescending(c => c.TotalAlbunsAvaliados).ToList();

        int pos = 1;
        foreach (var item in sorted)
        {
            item.Posicao = pos++;
        }

        return Ok(sorted);
    }
}

