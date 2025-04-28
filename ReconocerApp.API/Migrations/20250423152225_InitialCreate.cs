using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReconocerApp.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categorias",
                columns: table => new
                {
                    CategoriaId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Descripcion = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categorias", x => x.CategoriaId);
                });

            migrationBuilder.CreateTable(
                name: "Organizaciones",
                columns: table => new
                {
                    OrganizacionId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Descripcion = table.Column<string>(type: "TEXT", nullable: false),
                    DominioEmail = table.Column<string>(type: "TEXT", nullable: false),
                    Activa = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organizaciones", x => x.OrganizacionId);
                });

            migrationBuilder.CreateTable(
                name: "Reconocimientos",
                columns: table => new
                {
                    ReconocimientoId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TokenColaborador = table.Column<string>(type: "TEXT", nullable: false),
                    Justificacion = table.Column<string>(type: "TEXT", nullable: false),
                    Texto = table.Column<string>(type: "TEXT", nullable: false),
                    Titulo = table.Column<string>(type: "TEXT", nullable: false),
                    FechaCreacion = table.Column<string>(type: "TEXT", nullable: false),
                    Estado = table.Column<string>(type: "TEXT", nullable: false),
                    ComentarioRevision = table.Column<string>(type: "TEXT", nullable: false),
                    FechaResolucion = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reconocimientos", x => x.ReconocimientoId);
                });

            migrationBuilder.CreateTable(
                name: "WalletCategorias",
                columns: table => new
                {
                    CategoriaId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Descripcion = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WalletCategorias", x => x.CategoriaId);
                });

            migrationBuilder.CreateTable(
                name: "WalletSaldos",
                columns: table => new
                {
                    WalletSaldoId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TokenColaborador = table.Column<string>(type: "TEXT", nullable: false),
                    SaldoActual = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WalletSaldos", x => x.WalletSaldoId);
                });

            migrationBuilder.CreateTable(
                name: "Colaboradores",
                columns: table => new
                {
                    ColaboradorId = table.Column<string>(type: "TEXT", nullable: false),
                    OrganizacionId = table.Column<int>(type: "INTEGER", nullable: false),
                    ExcepcionConfiguracion = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Colaboradores", x => x.ColaboradorId);
                    table.ForeignKey(
                        name: "FK_Colaboradores_Organizaciones_OrganizacionId",
                        column: x => x.OrganizacionId,
                        principalTable: "Organizaciones",
                        principalColumn: "OrganizacionId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Comportamientos",
                columns: table => new
                {
                    ComportamientoId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    OrganizacionId = table.Column<int>(type: "INTEGER", nullable: false),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Descripcion = table.Column<string>(type: "TEXT", nullable: false),
                    WalletOtorgados = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comportamientos", x => x.ComportamientoId);
                    table.ForeignKey(
                        name: "FK_Comportamientos_Organizaciones_OrganizacionId",
                        column: x => x.OrganizacionId,
                        principalTable: "Organizaciones",
                        principalColumn: "OrganizacionId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MarketplacePremios",
                columns: table => new
                {
                    PremioId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    OrganizacionId = table.Column<int>(type: "INTEGER", nullable: false),
                    CategoriaId = table.Column<int>(type: "INTEGER", nullable: false),
                    Nombre = table.Column<string>(type: "TEXT", nullable: false),
                    Descripcion = table.Column<string>(type: "TEXT", nullable: false),
                    CostoWallet = table.Column<int>(type: "INTEGER", nullable: false),
                    ImagenUrl = table.Column<string>(type: "TEXT", nullable: false),
                    CantidadActual = table.Column<int>(type: "INTEGER", nullable: false),
                    UltimaActualizacion = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketplacePremios", x => x.PremioId);
                    table.ForeignKey(
                        name: "FK_MarketplacePremios_Categorias_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categorias",
                        principalColumn: "CategoriaId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MarketplacePremios_Organizaciones_OrganizacionId",
                        column: x => x.OrganizacionId,
                        principalTable: "Organizaciones",
                        principalColumn: "OrganizacionId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WalletTransacciones",
                columns: table => new
                {
                    TransaccionId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    WalletSaldoId = table.Column<int>(type: "INTEGER", nullable: false),
                    TokenColaborador = table.Column<string>(type: "TEXT", nullable: false),
                    CategoriaId = table.Column<int>(type: "INTEGER", nullable: false),
                    Cantidad = table.Column<int>(type: "INTEGER", nullable: false),
                    Descripcion = table.Column<string>(type: "TEXT", nullable: false),
                    Fecha = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WalletTransacciones", x => x.TransaccionId);
                    table.ForeignKey(
                        name: "FK_WalletTransacciones_WalletCategorias_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "WalletCategorias",
                        principalColumn: "CategoriaId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WalletTransacciones_WalletSaldos_WalletSaldoId",
                        column: x => x.WalletSaldoId,
                        principalTable: "WalletSaldos",
                        principalColumn: "WalletSaldoId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReconocimientoComportamientos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ReconocimientoId = table.Column<int>(type: "INTEGER", nullable: false),
                    ComportamientoId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReconocimientoComportamientos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReconocimientoComportamientos_Comportamientos_ComportamientoId",
                        column: x => x.ComportamientoId,
                        principalTable: "Comportamientos",
                        principalColumn: "ComportamientoId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReconocimientoComportamientos_Reconocimientos_ReconocimientoId",
                        column: x => x.ReconocimientoId,
                        principalTable: "Reconocimientos",
                        principalColumn: "ReconocimientoId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InventarioTransacciones",
                columns: table => new
                {
                    TransaccionId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PremioId = table.Column<int>(type: "INTEGER", nullable: false),
                    TipoMovimiento = table.Column<string>(type: "TEXT", nullable: false),
                    Cantidad = table.Column<int>(type: "INTEGER", nullable: false),
                    Descripcion = table.Column<string>(type: "TEXT", nullable: false),
                    Fecha = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventarioTransacciones", x => x.TransaccionId);
                    table.ForeignKey(
                        name: "FK_InventarioTransacciones_MarketplacePremios_PremioId",
                        column: x => x.PremioId,
                        principalTable: "MarketplacePremios",
                        principalColumn: "PremioId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MarketplaceCompras",
                columns: table => new
                {
                    CompraId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TokenColaborador = table.Column<string>(type: "TEXT", nullable: false),
                    PremioId = table.Column<int>(type: "INTEGER", nullable: false),
                    FechaCompra = table.Column<string>(type: "TEXT", nullable: false),
                    Estado = table.Column<string>(type: "TEXT", nullable: false),
                    ComentarioRevision = table.Column<string>(type: "TEXT", nullable: false),
                    FechaResolucion = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketplaceCompras", x => x.CompraId);
                    table.ForeignKey(
                        name: "FK_MarketplaceCompras_MarketplacePremios_PremioId",
                        column: x => x.PremioId,
                        principalTable: "MarketplacePremios",
                        principalColumn: "PremioId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Colaboradores_OrganizacionId",
                table: "Colaboradores",
                column: "OrganizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Comportamientos_OrganizacionId",
                table: "Comportamientos",
                column: "OrganizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_InventarioTransacciones_PremioId",
                table: "InventarioTransacciones",
                column: "PremioId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceCompras_PremioId",
                table: "MarketplaceCompras",
                column: "PremioId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketplacePremios_CategoriaId",
                table: "MarketplacePremios",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketplacePremios_OrganizacionId",
                table: "MarketplacePremios",
                column: "OrganizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_ReconocimientoComportamientos_ComportamientoId",
                table: "ReconocimientoComportamientos",
                column: "ComportamientoId");

            migrationBuilder.CreateIndex(
                name: "IX_ReconocimientoComportamientos_ReconocimientoId",
                table: "ReconocimientoComportamientos",
                column: "ReconocimientoId");

            migrationBuilder.CreateIndex(
                name: "IX_WalletTransacciones_CategoriaId",
                table: "WalletTransacciones",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_WalletTransacciones_WalletSaldoId",
                table: "WalletTransacciones",
                column: "WalletSaldoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Colaboradores");

            migrationBuilder.DropTable(
                name: "InventarioTransacciones");

            migrationBuilder.DropTable(
                name: "MarketplaceCompras");

            migrationBuilder.DropTable(
                name: "ReconocimientoComportamientos");

            migrationBuilder.DropTable(
                name: "WalletTransacciones");

            migrationBuilder.DropTable(
                name: "MarketplacePremios");

            migrationBuilder.DropTable(
                name: "Comportamientos");

            migrationBuilder.DropTable(
                name: "Reconocimientos");

            migrationBuilder.DropTable(
                name: "WalletCategorias");

            migrationBuilder.DropTable(
                name: "WalletSaldos");

            migrationBuilder.DropTable(
                name: "Categorias");

            migrationBuilder.DropTable(
                name: "Organizaciones");
        }
    }
}
