using ClubeDoAlbum.Api.Models.Enums;

namespace ClubeDoAlbum.Api.Models.Entities;

public class Album
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Edição / Semana temática (opcional se ainda estiver solto no backlog)
    public Guid? EdicaoId { get; set; }
    public Edicao? Edicao { get; set; }

    // Membro do clube que indicou
    public Guid? IndicadoPorUserId { get; set; }
    public User? IndicadoPorUser { get; set; }

    // Metadados vindos da API do Spotify
    public string? SpotifyId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Artista { get; set; } = string.Empty;
    public int AnoLancamento { get; set; }
    public string? CapaUrl { get; set; }
    public string? SpotifyUrl { get; set; }

    // Status no fluxo de votação do clube
    public AlbumStatus Status { get; set; } = AlbumStatus.EstaSemana;
    public decimal NotaMedia { get; set; } = 0m;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Relacionamentos
    public ICollection<Avaliacao> Avaliacoes { get; set; } = new List<Avaliacao>();
}

