using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace ClubeDoAlbum.Api.Services.Spotify;

public class SpotifyService : ISpotifyService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly SpotifySettings _settings;
    private const string CacheKeyToken = "spotify_access_token";

    public SpotifyService(
        HttpClient httpClient,
        IMemoryCache cache,
        IOptions<SpotifySettings> settings)
    {
        _httpClient = httpClient;
        _cache = cache;
        _settings = settings.Value;
    }

    private async Task<string> GetAccessTokenAsync()
    {
        if (_cache.TryGetValue(CacheKeyToken, out string? cachedToken) && !string.IsNullOrEmpty(cachedToken))
        {
            return cachedToken;
        }

        if (string.IsNullOrWhiteSpace(_settings.ClientId) || string.IsNullOrWhiteSpace(_settings.ClientSecret))
        {
            throw new InvalidOperationException("As credenciais do Spotify (ClientId e ClientSecret) não foram configuradas no appsettings.json.");
        }

        var authHeader = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_settings.ClientId}:{_settings.ClientSecret}"));
        using var tokenRequest = new HttpRequestMessage(HttpMethod.Post, "https://accounts.spotify.com/api/token");
        tokenRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", authHeader);
        tokenRequest.Content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("grant_type", "client_credentials")
        });

        var response = await _httpClient.SendAsync(tokenRequest);
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Falha ao autenticar na API do Spotify: {response.StatusCode} - {errorBody}");
        }

        var content = await response.Content.ReadAsStringAsync();
        var tokenResponse = JsonSerializer.Deserialize<SpotifyTokenResponse>(content);

        if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
        {
            throw new InvalidOperationException("Resposta inválida de token da API do Spotify.");
        }

        // Cache com margem de segurança de 60 segundos antes de expirar
        var cacheDuration = TimeSpan.FromSeconds(Math.Max(60, tokenResponse.ExpiresIn - 60));
        _cache.Set(CacheKeyToken, tokenResponse.AccessToken, cacheDuration);

        return tokenResponse.AccessToken;
    }

    public async Task<SpotifyAlbumDto?> GetAlbumByIdAsync(string spotifyId)
    {
        if (string.IsNullOrWhiteSpace(spotifyId)) return null;

        var token = await GetAccessTokenAsync();
        using var request = new HttpRequestMessage(HttpMethod.Get, $"https://api.spotify.com/v1/albums/{spotifyId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _httpClient.SendAsync(request);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Erro ao buscar álbum no Spotify ({response.StatusCode}): {err}");
        }

        var content = await response.Content.ReadAsStringAsync();
        var album = JsonSerializer.Deserialize<SpotifyAlbumItem>(content);

        return album != null ? MapToDto(album) : null;
    }

    public async Task<List<SpotifyAlbumDto>> SearchAlbumsAsync(string query, int limit = 5)
    {
        if (string.IsNullOrWhiteSpace(query)) return new List<SpotifyAlbumDto>();

        var token = await GetAccessTokenAsync();
        var url = $"https://api.spotify.com/v1/search?q={Uri.EscapeDataString(query)}&type=album&limit={Math.Clamp(limit, 1, 20)}";

        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Erro na busca do Spotify ({response.StatusCode}): {err}");
        }

        var content = await response.Content.ReadAsStringAsync();
        var searchResult = JsonSerializer.Deserialize<SpotifySearchResponse>(content);

        if (searchResult?.Albums?.Items == null) return new List<SpotifyAlbumDto>();

        return searchResult.Albums.Items
            .Select(MapToDto)
            .ToList();
    }

    public async Task<SpotifyAlbumDto?> ResolveAlbumAsync(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return null;

        // 1. Tenta extrair ID de link do Spotify (ex: https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy?si=...)
        // ou formato URI (spotify:album:4aawyAB9vmqN3uQ7FjRGTy)
        var match = Regex.Match(input, @"(?:spotify:album:|open\.spotify\.com\/album\/)([a-zA-Z0-9]{22})", RegexOptions.IgnoreCase);
        if (match.Success)
        {
            var spotifyId = match.Groups[1].Value;
            return await GetAlbumByIdAsync(spotifyId);
        }

        // 2. Se for um ID puro de 22 caracteres alfanuméricos
        if (Regex.IsMatch(input.Trim(), @"^[a-zA-Z0-9]{22}$"))
        {
            var album = await GetAlbumByIdAsync(input.Trim());
            if (album != null) return album;
        }

        // 3. Caso contrário, faz a busca pelo texto e retorna o resultado mais relevante
        var results = await SearchAlbumsAsync(input, limit: 1);
        return results.FirstOrDefault();
    }

    private static SpotifyAlbumDto MapToDto(SpotifyAlbumItem item)
    {
        int ano = 0;
        if (!string.IsNullOrEmpty(item.ReleaseDate))
        {
            var yearPart = item.ReleaseDate.Length >= 4 ? item.ReleaseDate[..4] : item.ReleaseDate;
            int.TryParse(yearPart, out ano);
        }

        var artistas = item.Artists != null && item.Artists.Count > 0
            ? string.Join(", ", item.Artists.Select(a => a.Name))
            : "Artista Desconhecido";

        var capa = item.Images != null && item.Images.Count > 0
            ? item.Images[0].Url
            : null;

        return new SpotifyAlbumDto
        {
            SpotifyId = item.Id ?? string.Empty,
            Titulo = item.Name ?? string.Empty,
            Artista = artistas,
            AnoLancamento = ano,
            CapaUrl = capa,
            SpotifyUrl = item.ExternalUrls?.Spotify
        };
    }

    #region Modelos Internos para Desserialização da API do Spotify
    private class SpotifyTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
    }

    private class SpotifySearchResponse
    {
        [JsonPropertyName("albums")]
        public SpotifyAlbumList? Albums { get; set; }
    }

    private class SpotifyAlbumList
    {
        [JsonPropertyName("items")]
        public List<SpotifyAlbumItem>? Items { get; set; }
    }

    private class SpotifyAlbumItem
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("release_date")]
        public string? ReleaseDate { get; set; }

        [JsonPropertyName("artists")]
        public List<SpotifyArtistItem>? Artists { get; set; }

        [JsonPropertyName("images")]
        public List<SpotifyImageItem>? Images { get; set; }

        [JsonPropertyName("external_urls")]
        public SpotifyExternalUrls? ExternalUrls { get; set; }
    }

    private class SpotifyArtistItem
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }
    }

    private class SpotifyImageItem
    {
        [JsonPropertyName("url")]
        public string? Url { get; set; }
    }

    private class SpotifyExternalUrls
    {
        [JsonPropertyName("spotify")]
        public string? Spotify { get; set; }
    }
    #endregion
}
