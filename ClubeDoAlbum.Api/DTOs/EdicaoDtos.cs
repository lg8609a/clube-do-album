namespace ClubeDoAlbum.Api.DTOs;

public class CreateEdicaoDto
{
    public int? Numero { get; set; }
    public string Tema { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateOnly? DataReuniao { get; set; }
    public bool AtivarImediatamente { get; set; } = true;
}

public class UpdateEdicaoDto
{
    public string? Tema { get; set; }
    public string? Descricao { get; set; }
    public DateOnly? DataReuniao { get; set; }
    public string? Status { get; set; } // Planejada, EmAndamento, Finalizada
}

public class EdicaoResponseDto
{
    public Guid Id { get; set; }
    public int Numero { get; set; }
    public string Tema { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateOnly? DataReuniao { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int TotalAlbuns { get; set; }
    public decimal? NotaMediaGeral { get; set; }
    public List<AlbumResponseDto> Albuns { get; set; } = new();
}

public class MembroIndicacoesStatusDto
{
    public Guid UserId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public int TotalIndicados { get; set; }
    public int LimiteMaximo { get; set; } = 2;
    public bool PodeIndicarMais => TotalIndicados < LimiteMaximo;
    public List<string> AlbunsIndicadosTitulos { get; set; } = new();
}
