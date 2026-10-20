using ClubeDoAlbum.Api.Common;

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
    public string Status { get; set; } = string.Empty;
    public decimal NotaMedia { get; set; }
    public string Classificacao => ClassificacaoNotaHelper.ObterClassificacao(NotaMedia);
    public int TotalAvaliacoes { get; set; }
    public DateTime CreatedAt { get; set; }

    public Guid? EdicaoId { get; set; }
    public string? EdicaoTema { get; set; }

    public UserDto? IndicadoPor { get; set; }
}

public class AlbumDetailDto : AlbumResponseDto
{
    public List<ReviewResponseDto> Avaliacoes { get; set; } = new();
}

public class UpdateAlbumStatusDto
{
    public string Status { get; set; } = string.Empty; // "EstaSemana" ou "JaOuvido"
    public Guid? EdicaoId { get; set; }
}

/// <summary>
/// DTO completo para cadastrar álbuns retroativos com todas as notas de uma só vez (sem passar pela fila da semana).
/// </summary>
public class CadastrarAlbumRetroativoDto
{
    public string? SpotifyInput { get; set; }
    public string? Titulo { get; set; }
    public string? Artista { get; set; }
    public int? AnoLancamento { get; set; }
    public string? CapaUrl { get; set; }
    public string? SpotifyUrl { get; set; }
    public string? SpotifyId { get; set; }

    // Quem indicou: pode passar o nome da pessoa na planilha ou o UserId existente
    public string? IndicadoPorNome { get; set; }
    public Guid? IndicadoPorUserId { get; set; }

    // Tema ou Edição da semana da época (opcional)
    public string? TemaEdicao { get; set; }
    public int? NumeroEdicao { get; set; }
    public DateOnly? DataReuniao { get; set; }

    // Lista de todas as notas dadas pelos membros na reunião
    public List<RetroAvaliacaoItemDto> Avaliacoes { get; set; } = new();
}

public class RetroAvaliacaoItemDto
{
    // Pode passar o Nome do amigo na planilha ou o UserId
    public string? NomeUsuario { get; set; }
    public Guid? UserId { get; set; }
    public decimal Nota { get; set; } // 0.0 a 10.0
    public string? Comentario { get; set; }
}
