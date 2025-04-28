using Microsoft.EntityFrameworkCore;
using ReconocerApp.API.Models;

namespace ReconocerApp.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) {}

    public DbSet<WalletSaldo> WalletSaldos => Set<WalletSaldo>();
    public DbSet<WalletTransaccion> WalletTransacciones => Set<WalletTransaccion>();
    public DbSet<WalletCategoria> WalletCategorias => Set<WalletCategoria>();
    public DbSet<Comportamiento> Comportamientos => Set<Comportamiento>();
    public DbSet<MarketplacePremio> MarketplacePremios => Set<MarketplacePremio>();
    public DbSet<InventarioTransaccion> InventarioTransacciones => Set<InventarioTransaccion>();
    public DbSet<MarketplaceCompra> MarketplaceCompras => Set<MarketplaceCompra>();
    public DbSet<Reconocimiento> Reconocimientos => Set<Reconocimiento>();
    public DbSet<ReconocimientoComportamiento> ReconocimientoComportamientos => Set<ReconocimientoComportamiento>();
    public DbSet<Colaborador> Colaboradores => Set<Colaborador>();
    public DbSet<Organizacion> Organizaciones => Set<Organizacion>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
}
