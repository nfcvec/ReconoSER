using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReconocerApp.API.Migrations
{
    /// <inheritdoc />
    public partial class Color : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ColorPrincipal",
                table: "Organizaciones",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ColorPrincipal",
                table: "Organizaciones");
        }
    }
}
