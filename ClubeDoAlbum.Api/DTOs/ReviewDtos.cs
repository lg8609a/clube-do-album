namespace ClubeDoAlbum.Api.DTOs;

public class CreateReviewDto
{
    public Guid AlbumId { get; set; }
    public decimal Nota { get; set; } // 0.0 a 10.0
    public string? Comentario { get; set; }

    /// <summary>
    /// Opcional se o usuário estiver autenticado via token JWT.
    /// </summary>
    public Guid? UserId { get; set; }
}

public class ReviewResponseDto
{
    public Guid Id { get; set; }
    public Guid AlbumId { get; set; }
    public decimal Nota { get; set; }
    public string? Comentario { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public UserDto Usuario { get; set; } = null!;
}

public class UserReviewDetailDto
{
    public Guid Id { get; set; }
    public Guid AlbumId { get; set; }
    public string AlbumTitulo { get; set; } = string.Empty;
    public string AlbumArtista { get; set; } = string.Empty;
    public int? AlbumAnoLancamento { get; set; }
    public string? AlbumCapaUrl { get; set; }
    public string? AlbumSpotifyUrl { get; set; }
    public decimal AlbumNotaMedia { get; set; }
    public string AlbumClassificacao { get; set; } = string.Empty;
    public decimal Nota { get; set; }
    public string? Comentario { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
