using System.Security.Claims;
using BCrypt.Net;
using ClubeDoAlbum.Api.Data;
using ClubeDoAlbum.Api.DTOs;
using ClubeDoAlbum.Api.Models.Entities;
using ClubeDoAlbum.Api.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubeDoAlbum.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthController(AppDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    /// <summary>
    /// Cadastra um novo membro no Clube do Álbum.
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Senha))
        {
            return BadRequest(new { message = "Nome, email e senha são obrigatórios." });
        }

        var emailNormalizado = request.Email.Trim().ToLower();

        if (!new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(emailNormalizado))
        {
            return BadRequest(new { message = "O e-mail informado não possui um formato válido." });
        }

        if (request.Senha.Length < 6)
        {
            return BadRequest(new { message = "A senha deve conter no mínimo 6 caracteres." });
        }

        var emailExiste = await _context.Users.AnyAsync(u => u.Email.ToLower() == emailNormalizado);
        if (emailExiste)
        {
            return Conflict(new { message = "Este e-mail já está cadastrado no clube." });
        }


        var senhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha);

        // Se for o primeiro usuário cadastrado, concede permissão de Admin automaticamente
        var isPrimeiroUsuario = !await _context.Users.AnyAsync();

        var user = new User
        {
            Nome = request.Nome.Trim(),
            Email = emailNormalizado,
            SenhaHash = senhaHash,
            AvatarUrl = request.AvatarUrl?.Trim(),
            IsAdmin = isPrimeiroUsuario,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);

        return CreatedAtAction(nameof(GetMe), new AuthResponseDto
        {
            Token = token,
            Usuario = MapToUserDto(user)
        });
    }

    /// <summary>
    /// Realiza o login de um membro com e-mail e senha, retornando o token JWT.
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Senha))
        {
            return BadRequest(new { message = "E-mail e senha são obrigatórios." });
        }

        var emailNormalizado = request.Email.Trim().ToLower();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailNormalizado);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Senha, user.SenhaHash))
        {
            return Unauthorized(new { message = "E-mail ou senha inválidos." });
        }

        var token = _tokenService.GenerateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Usuario = MapToUserDto(user)
        });
    }

    /// <summary>
    /// Retorna os dados do usuário atualmente autenticado via JWT.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetMe()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Usuário não encontrado." });
        }

        return Ok(MapToUserDto(user));
    }

    /// <summary>
    /// Lista todos os membros cadastrados no clube (útil para dropdown de amigos no front).
    /// </summary>
    [HttpGet("users")]
    public async Task<ActionResult<List<UserDto>>> GetAllUsers()
    {
        var users = await _context.Users
            .OrderBy(u => u.Nome)
            .Select(u => MapToUserDto(u))
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>
    /// Atualiza dados de perfil (Nome, AvatarUrl) do usuário logado.
    /// </summary>
    [HttpPut("profile")]
    [Authorize]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileDto request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Usuário não encontrado." });
        }

        if (!string.IsNullOrWhiteSpace(request.Nome))
        {
            user.Nome = request.Nome.Trim();
        }

        user.AvatarUrl = string.IsNullOrWhiteSpace(request.AvatarUrl) ? null : request.AvatarUrl.Trim();
        await _context.SaveChangesAsync();

        return Ok(MapToUserDto(user));
    }

    /// <summary>
    /// Altera a senha do usuário logado.
    /// </summary>
    [HttpPut("password")]
    [Authorize]
    public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDto request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Usuário não encontrado." });
        }

        if (!string.IsNullOrEmpty(user.SenhaHash) && !string.IsNullOrEmpty(request.SenhaAtual))
        {
            if (!BCrypt.Net.BCrypt.Verify(request.SenhaAtual, user.SenhaHash))
            {
                return BadRequest(new { message = "Senha atual incorreta." });
            }
        }

        if (string.IsNullOrWhiteSpace(request.NovaSenha) || request.NovaSenha.Length < 6)
        {
            return BadRequest(new { message = "A nova senha deve ter no mínimo 6 caracteres." });
        }

        user.SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.NovaSenha);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Senha atualizada com sucesso!" });
    }

    private static UserDto MapToUserDto(User user) => new()
    {
        Id = user.Id,
        Nome = user.Nome,
        Email = user.Email,
        AvatarUrl = user.AvatarUrl,
        IsAdmin = user.IsAdmin
    };
}
