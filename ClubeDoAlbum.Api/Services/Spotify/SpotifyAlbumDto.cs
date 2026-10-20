namespace ClubeDoAlbum.Api.Services.Spotify;

public class SpotifyAlbumDto
{
    public string SpotifyId { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string Artista { get; set; } = string.Empty;
    public int AnoLancamento { get; set; }
    public string? CapaUrl { get; set; }
    public string? SpotifyUrl { get; set; }
}
