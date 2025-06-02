using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReconocerApp.API.Migrations
{
    /// <inheritdoc />
    public partial class Comentario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Comentario",
                table: "MarketplaceCompras",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Comentario",
                table: "MarketplaceCompras");
        }
    }
}
