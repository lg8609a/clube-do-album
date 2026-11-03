using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClubeDoAlbum.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPaisOrigemToAlbum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaisOrigem",
                table: "albums",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaisOrigem",
                table: "albums");
        }
    }
}
