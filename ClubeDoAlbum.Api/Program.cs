using Microsoft.EntityFrameworkCore;
using ClubeDoAlbum.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Database Context (PostgreSQL / Supabase)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Caching em memória (para tokens do Spotify e buscas frequentes)
builder.Services.AddMemoryCache();

// Configurações e Serviço da API do Spotify
builder.Services.Configure<ClubeDoAlbum.Api.Services.Spotify.SpotifySettings>(
    builder.Configuration.GetSection("Spotify"));
builder.Services.AddHttpClient<ClubeDoAlbum.Api.Services.Spotify.ISpotifyService, ClubeDoAlbum.Api.Services.Spotify.SpotifyService>();

// Serviço de Token JWT
builder.Services.AddScoped<ClubeDoAlbum.Api.Services.Auth.ITokenService, ClubeDoAlbum.Api.Services.Auth.TokenService>();

// Autenticação JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? "ClubeDoAlbumSuperSecretKey_2026_MuitoSegura_12345!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ClubeDoAlbumApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ClubeDoAlbumWeb";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtKey))
    };
});
builder.Services.AddAuthorization();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// CORS para permitir comunicação com o frontend em React (Vite: 5173)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.Run();

