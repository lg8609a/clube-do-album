using ClubeDoAlbum.Api.Common;
using ClubeDoAlbum.Api.Services.Spotify;

namespace ClubeDoAlbum.Api.DTOs;

public class CreateAlbumDto
{
    /// <summary>
    /// Opcional: Se preenchido com um link (open.spotify.com/album/...) ou texto ("Blackwater Park - Opeth"),
    /// a API busca e preenche automaticamente os dados do Spotify.
    /// </summary>
    public string? SpotifyInput { get; set; }

    public string? Titulo { get; set; }
    public string? Artista { get; set; }
    public int? AnoLancamento { get; set; }
    public string? CapaUrl { get; set; }
    public string? SpotifyUrl { get; set; }
    public string? SpotifyId { get; set; }
    public string? PaisOrigem { get; set; }

    public Guid? EdicaoId { get; set; }
    public Guid? IndicadoPorUserId { get; set; }
    
    /// <summary>
    /// Define se entra direto como 'EstaSemana' (padrão) ou 'JaOuvido'.
    /// </summary>
    public string? Status { get; set; }
}

public class AlbumResponseDto
{
    public Guid Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Artista { get; set; } = string.Empty;
    public int AnoLancamento { get; set; }
    public string? CapaUrl { get; set; }
    public string? SpotifyUrl { get; set; }
    public string? SpotifyId { get; set; }
    public string? PaisOrigem { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal NotaMedia { get; set; }
    public string Classificacao => ClassificacaoNotaHelper.ObterClassificacao(NotaMedia);
    public int TotalAvaliacoes { get; set; }
    public DateTime CreatedAt { get; set; }

    public Guid? EdicaoId { get; set; }
    public string? EdicaoTema { get; set; }

    public decimal? MinhaNota { get; set; }
    public bool JaAvaliadoPorMim => MinhaNota.HasValue;

    public UserDto? IndicadoPor { get; set; }
}

public class AlbumDetailDto : AlbumResponseDto
{
    public List<ReviewResponseDto> Avaliacoes { get; set; } = new();
    public List<SpotifyTrackDto> Faixas { get; set; } = new();
}

public class UpdateAlbumStatusDto
{
    public string Status { get; set; } = string.Empty; // "EstaSemana" ou "JaOuvido"
    public Guid? EdicaoId { get; set; }
}
