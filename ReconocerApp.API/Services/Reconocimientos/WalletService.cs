using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ReconocerApp.API.Data;
using ReconocerApp.API.Models;

namespace ReconocerApp.API.Services.Reconocimientos;

public class WalletService : IWalletService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<WalletService> _logger;

    public WalletService(ApplicationDbContext context, ILogger<WalletService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<WalletSaldo> ObtenerOCrearWalletAsync(string tokenColaborador)
    {
        var walletSaldo = await _context.WalletSaldos
            .FirstOrDefaultAsync(ws => ws.TokenColaborador == tokenColaborador);

        if (walletSaldo == null)
        {
            walletSaldo = new WalletSaldo
            {
                TokenColaborador = tokenColaborador,
                SaldoActual = 0
            };
            _context.WalletSaldos.Add(walletSaldo);
            await _context.SaveChangesAsync();
        }

        return walletSaldo;
    }

    public async Task<WalletCategoria> ObtenerOCrearCategoriaReconocimientosAsync()
    {
        var categoriaReconocimientos = await _context.WalletCategorias
            .FirstOrDefaultAsync(c => c.Nombre.ToLower() == "reconocimientos" || 
                                    c.Nombre.ToLower().Contains("reconocimiento"));

        if (categoriaReconocimientos == null)
        {
            var todasCategorias = await _context.WalletCategorias.ToListAsync();
            categoriaReconocimientos = todasCategorias
                .FirstOrDefault(c => c.Nombre.Contains("reconocimiento", StringComparison.OrdinalIgnoreCase));
            
            if (categoriaReconocimientos == null)
            {
                categoriaReconocimientos = new WalletCategoria
                {
                    Nombre = "Reconocimientos",
                    Descripcion = "ULIs otorgados por reconocimientos"
                };
                _context.WalletCategorias.Add(categoriaReconocimientos);
                await _context.SaveChangesAsync();
            }
        }

        return categoriaReconocimientos;
    }

    public async Task<WalletSaldo> ActualizarSaldoAsync(string tokenColaborador, int cantidadULIs, string descripcion, int? reconocimientoId = null)
    {
        if (cantidadULIs <= 0)
        {
            _logger.LogWarning($"Se intentó generar {cantidadULIs} ULIs para el usuario {tokenColaborador}, operación ignorada");
            return await ObtenerOCrearWalletAsync(tokenColaborador);
        }

        var walletSaldo = await ObtenerOCrearWalletAsync(tokenColaborador);
        var categoria = await ObtenerOCrearCategoriaReconocimientosAsync();

        var transaccion = new WalletTransaccion
        {
            WalletSaldoId = walletSaldo.WalletSaldoId,
            TokenColaborador = tokenColaborador,
            CategoriaId = categoria.CategoriaId,
            Cantidad = cantidadULIs,
            Descripcion = descripcion,
            Fecha = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
        };

        _context.WalletTransacciones.Add(transaccion);

        // Calcular el saldo total sumando todas las transacciones del usuario
        var totalSaldo = await _context.WalletTransacciones
            .Where(wt => wt.TokenColaborador == tokenColaborador)
            .SumAsync(wt => wt.Cantidad) + cantidadULIs;

        walletSaldo.SaldoActual = totalSaldo;
        _context.WalletSaldos.Update(walletSaldo);
        await _context.SaveChangesAsync();

        return walletSaldo;
    }

    public async Task GenerarULIsParaReconocimientoAsync(Reconocimiento reconocimiento)
    {
        if (reconocimiento.ReconocimientoComportamientos == null || 
            !reconocimiento.ReconocimientoComportamientos.Any()) 
        {
            _logger.LogWarning($"El reconocimiento {reconocimiento.ReconocimientoId} no tiene comportamientos asociados para generar ULIs");
            return;
        }

        // Calcular total de ULIs a otorgar
        int totalULIs = 0;
        foreach (var rc in reconocimiento.ReconocimientoComportamientos)
        {
            if (rc?.Comportamiento != null)
            {
                totalULIs += rc.Comportamiento.WalletOtorgados;
            }
        }

        if (totalULIs <= 0) return;

        string descripcion = $"ULIs otorgados por reconocimiento #{reconocimiento.ReconocimientoId}";
        await ActualizarSaldoAsync(reconocimiento.ReconocidoId, totalULIs, descripcion, reconocimiento.ReconocimientoId);
    }
}