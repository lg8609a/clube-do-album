namespace ClubeDoAlbum.Api.Services.MusicBrainz;

public interface IMusicBrainzService
{
    /// <summary>
    /// Consulta o MusicBrainz pelo nome do artista/banda e retorna o código ISO 3166-1 alpha-2 do país de origem (ex: "GB", "BR", "US").
    /// </summary>
    Task<string?> ObterPaisOrigemArtistaAsync(string nomeArtista);
}
