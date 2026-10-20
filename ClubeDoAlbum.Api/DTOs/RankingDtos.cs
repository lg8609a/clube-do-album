using ClubeDoAlbum.Api.Common;

namespace ClubeDoAlbum.Api.DTOs;

public class RankingItemDto
{
    public int Posicao { get; set; }
    public Guid AlbumId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Artista { get; set; } = string.Empty;
    public int AnoLancamento { get; set; }
    public string? CapaUrl { get; set; }
    public string? SpotifyUrl { get; set; }
    public decimal NotaMedia { get; set; }
    public string Classificacao => ClassificacaoNotaHelper.ObterClassificacao(NotaMedia);
    public int TotalAvaliacoes { get; set; }
    public string? EdicaoTema { get; set; }
    public string? IndicadoPorNome { get; set; }
    public List<TopCommentDto> ComentariosDestaque { get; set; } = new();
}

public class TopCommentDto
{
    public string NomeUsuario { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public decimal Nota { get; set; }
    public string Comentario { get; set; } = string.Empty;
}

public class CuratorRankingDto
{
    public int Posicao { get; set; }
    public Guid UserId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public int TotalAlbunsIndicados { get; set; }
    public int TotalAlbunsAvaliados { get; set; }
    public decimal MediaDasIndicacoes { get; set; }
    public string ClassificacaoCurador => ClassificacaoNotaHelper.ObterClassificacao(MediaDasIndicacoes);
    public BestWorstAlbumDto? MelhorAlbumIndicado { get; set; }
    public BestWorstAlbumDto? PiorAlbumIndicado { get; set; }
}

public class BestWorstAlbumDto
{
    public Guid AlbumId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Artista { get; set; } = string.Empty;
    public string? CapaUrl { get; set; }
    public decimal NotaMedia { get; set; }
    public string Classificacao => ClassificacaoNotaHelper.ObterClassificacao(NotaMedia);
}
