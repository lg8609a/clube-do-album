namespace ClubeDoAlbum.Api.Models.Entities;

public class Avaliacao
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid AlbumId { get; set; }
    public Album Album { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public decimal Nota { get; set; } // 0.0 a 10.0
    public string? Comentario { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

