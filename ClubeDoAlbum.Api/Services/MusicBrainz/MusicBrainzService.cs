using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Memory;

namespace ClubeDoAlbum.Api.Services.MusicBrainz;

public class MusicBrainzService : IMusicBrainzService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<MusicBrainzService> _logger;

    public MusicBrainzService(
        HttpClient httpClient,
        IMemoryCache cache,
        ILogger<MusicBrainzService> logger)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;

        // MusicBrainz exige um User-Agent descritivo conforme suas diretrizes de API
        if (!_httpClient.DefaultRequestHeaders.Contains("User-Agent"))
        {
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "ClubeDoAlbum/1.0.0 (contato@clubedoalbum.local)");
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }
    }

    public async Task<string?> ObterPaisOrigemArtistaAsync(string nomeArtista)
    {
        if (string.IsNullOrWhiteSpace(nomeArtista)) return null;

        var cacheKey = $"mb_artist_country_{nomeArtista.Trim().ToLowerInvariant()}";
        if (_cache.TryGetValue(cacheKey, out string? cachedCountry))
        {
            return cachedCountry;
        }

        try
        {
            // Busca o artista na API do MusicBrainz
            var url = $"https://musicbrainz.org/ws/2/artist/?query=artist:{Uri.EscapeDataString(nomeArtista.Trim())}&fmt=json&limit=3";
            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("MusicBrainz retornou status {Status} para artista '{Artista}'", response.StatusCode, nomeArtista);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<MusicBrainzSearchResponse>(json);

            if (result?.Artists == null || result.Artists.Count == 0)
            {
                _cache.Set(cacheKey, (string?)null, TimeSpan.FromDays(7));
                return null;
            }

            // Encontra o resultado mais relevante
            var artistMatch = result.Artists
                .FirstOrDefault(a => string.Equals(a.Name, nomeArtista.Trim(), StringComparison.OrdinalIgnoreCase))
                ?? result.Artists[0];

            string? countryCode = null;

            if (!string.IsNullOrWhiteSpace(artistMatch.Country))
            {
                countryCode = artistMatch.Country.Trim().ToUpperInvariant();
            }
            else if (artistMatch.Area?.IsoCodes != null && artistMatch.Area.IsoCodes.Count > 0)
            {
                countryCode = artistMatch.Area.IsoCodes[0].Trim().ToUpperInvariant();
            }

            // Armazena no cache por 30 dias para evitar chamadas redundantes
            _cache.Set(cacheKey, countryCode, TimeSpan.FromDays(30));
            return countryCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao consultar país de origem no MusicBrainz para '{Artista}'", nomeArtista);
            return null;
        }
    }

    #region Modelos de Desserialização do MusicBrainz
    private class MusicBrainzSearchResponse
    {
        [JsonPropertyName("artists")]
        public List<MusicBrainzArtistItem>? Artists { get; set; }
    }

    private class MusicBrainzArtistItem
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("country")]
        public string? Country { get; set; }

        [JsonPropertyName("area")]
        public MusicBrainzAreaItem? Area { get; set; }
    }

    private class MusicBrainzAreaItem
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("iso-3166-1-codes")]
        public List<string>? IsoCodes { get; set; }
    }
    #endregion
}
