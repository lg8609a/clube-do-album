using Microsoft.EntityFrameworkCore;
using ClubeDoAlbum.Api.Models.Entities;

namespace ClubeDoAlbum.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Edicao> Edicoes => Set<Edicao>();
    public DbSet<Album> Albums => Set<Album>();
    public DbSet<Avaliacao> Avaliacoes => Set<Avaliacao>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Nome).HasMaxLength(150).IsRequired();
            entity.Property(u => u.Email).HasMaxLength(255).IsRequired();
            entity.Property(u => u.SenhaHash).IsRequired();
        });

        // Edicao
        modelBuilder.Entity<Edicao>(entity =>
        {
            entity.ToTable("edicoes");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Numero).IsUnique();
            entity.Property(e => e.Tema).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Status)
                  .HasConversion(
                      v => v.ToString(),
                      v => ParseEdicaoStatus(v));
        });

        // Album
        modelBuilder.Entity<Album>(entity =>
        {
            entity.ToTable("albums");
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Titulo).HasMaxLength(250).IsRequired();
            entity.Property(a => a.Artista).HasMaxLength(250).IsRequired();
            entity.Property(a => a.Status)
                  .HasConversion(
                      v => v.ToString(),
                      v => ParseAlbumStatus(v));
            entity.Property(a => a.NotaMedia).HasPrecision(3, 1);



            entity.HasOne(a => a.Edicao)
                  .WithMany(e => e.Albuns)
                  .HasForeignKey(a => a.EdicaoId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(a => a.IndicadoPorUser)
                  .WithMany(u => u.AlbunsIndicados)
                  .HasForeignKey(a => a.IndicadoPorUserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Avaliacao
        modelBuilder.Entity<Avaliacao>(entity =>
        {
            entity.ToTable("avaliacoes");
            entity.HasKey(av => av.Id);
            entity.Property(av => av.Nota).HasPrecision(3, 1).IsRequired();

            // Regra de negócio: Cada membro só pode avaliar uma única vez o mesmo álbum
            entity.HasIndex(av => new { av.AlbumId, av.UserId }).IsUnique();

            entity.HasOne(av => av.Album)
                  .WithMany(a => a.Avaliacoes)
                  .HasForeignKey(av => av.AlbumId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(av => av.User)
                  .WithMany(u => u.Avaliacoes)
                  .HasForeignKey(av => av.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static ClubeDoAlbum.Api.Models.Enums.AlbumStatus ParseAlbumStatus(string v)
    {
        if (string.Equals(v, "Finalizado", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(v, "JaOuvido", StringComparison.OrdinalIgnoreCase))
        {
            return ClubeDoAlbum.Api.Models.Enums.AlbumStatus.JaOuvido;
        }

        if (string.Equals(v, "Backlog", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(v, "EmAvaliacao", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(v, "EstaSemana", StringComparison.OrdinalIgnoreCase))
        {
            return ClubeDoAlbum.Api.Models.Enums.AlbumStatus.EstaSemana;
        }

        return Enum.TryParse<ClubeDoAlbum.Api.Models.Enums.AlbumStatus>(v, true, out var s) 
            ? s 
            : ClubeDoAlbum.Api.Models.Enums.AlbumStatus.JaOuvido;
    }

    private static ClubeDoAlbum.Api.Models.Enums.EdicaoStatus ParseEdicaoStatus(string v)
    {
        return Enum.TryParse<ClubeDoAlbum.Api.Models.Enums.EdicaoStatus>(v, true, out var s)
            ? s
            : ClubeDoAlbum.Api.Models.Enums.EdicaoStatus.Planejada;
    }
}


