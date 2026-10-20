using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ClubeDoAlbum.Api.Models.Entities;
using Microsoft.IdentityModel.Tokens;

namespace ClubeDoAlbum.Api.Services.Auth;

public interface ITokenService
{
    string GenerateToken(User user);
}

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var keyString = _configuration["Jwt:Key"] ?? "ChavePadraoSuperSecretaClubeDoAlbum123!";
        var issuer = _configuration["Jwt:Issuer"] ?? "ClubeDoAlbumApi";
        var audience = _configuration["Jwt:Audience"] ?? "ClubeDoAlbumWeb";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Nome),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "Member")
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30), // Sessão longa e agradável para uso entre amigos
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
