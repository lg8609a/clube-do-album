namespace ClubeDoAlbum.Api.Services.Spotify;

public interface ISpotifyService
{
    Task<SpotifyAlbumDto?> GetAlbumByIdAsync(string spotifyId);
    Task<List<SpotifyAlbumDto>> SearchAlbumsAsync(string query, int limit = 5);
    Task<SpotifyAlbumDto?> ResolveAlbumAsync(string input);
}
