using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReconocerApp.API.Migrations
{
    /// <inheritdoc />
    public partial class IconSvg : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IconSvg",
                table: "Organizaciones",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IconSvg",
                table: "Organizaciones");
        }
    }
}
