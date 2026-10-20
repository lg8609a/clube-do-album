using ClubeDoAlbum.Api.Models.Enums;

namespace ClubeDoAlbum.Api.Models.Entities;

public class Edicao
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int Numero { get; set; }
    public string Tema { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateOnly? DataReuniao { get; set; }
    public EdicaoStatus Status { get; set; } = EdicaoStatus.Planejada;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Relacionamentos
    public ICollection<Album> Albuns { get; set; } = new List<Album>();
}

