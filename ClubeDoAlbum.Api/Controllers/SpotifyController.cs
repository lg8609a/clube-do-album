using ClubeDoAlbum.Api.Services.Spotify;
using Microsoft.AspNetCore.Mvc;

namespace ClubeDoAlbum.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpotifyController : ControllerBase
{
    private readonly ISpotifyService _spotifyService;

    public SpotifyController(ISpotifyService spotifyService)
    {
        _spotifyService = spotifyService;
    }

    /// <summary>
    /// Resolve um álbum a partir de um link do Spotify (open.spotify.com/album/...) ou texto de busca (ex: "Blackwater Park - Opeth").
    /// </summary>
    [HttpGet("resolve")]
    public async Task<ActionResult<SpotifyAlbumDto>> Resolve([FromQuery] string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return BadRequest(new { message = "O parâmetro 'input' é obrigatório (pode ser o link do Spotify ou o nome do álbum/artista)." });
        }

        try
        {
            var album = await _spotifyService.ResolveAlbumAsync(input);
            if (album == null)
            {
                return NotFound(new { message = "Nenhum álbum encontrado no Spotify para os dados informados." });
            }

            return Ok(album);
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao consultar o Spotify: {ex.Message}" });
        }
    }

    /// <summary>
    /// Busca até N álbuns no catálogo do Spotify por texto.
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<List<SpotifyAlbumDto>>> Search([FromQuery] string query, [FromQuery] int limit = 5)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest(new { message = "O parâmetro 'query' é obrigatório." });
        }

        try
        {
            var results = await _spotifyService.SearchAlbumsAsync(query, limit);
            return Ok(results);
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar álbuns no Spotify: {ex.Message}" });
        }
    }

    /// <summary>
    /// Busca um álbum diretamente pelo seu ID do Spotify.
    /// </summary>
    [HttpGet("album/{id}")]
    public async Task<ActionResult<SpotifyAlbumDto>> GetById(string id)
    {
        try
        {
            var album = await _spotifyService.GetAlbumByIdAsync(id);
            if (album == null)
            {
                return NotFound(new { message = $"Álbum com ID '{id}' não encontrado no Spotify." });
            }

            return Ok(album);
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao obter álbum: {ex.Message}" });
        }
    }
}
