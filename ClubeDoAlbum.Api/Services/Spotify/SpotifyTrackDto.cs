namespace ClubeDoAlbum.Api.Services.Spotify;

public class SpotifyTrackDto
{
    public int Numero { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public int DuracaoMs { get; set; }
    public string DuracaoFormatada { get; set; } = "00:00";
    public string? SpotifyUrl { get; set; }
    public bool Explicit { get; set; }
    public int DiscoNumero { get; set; } = 1;
}
