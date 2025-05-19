using ReconocerApp.API.Models;

namespace ReconocerApp.API.Services.Reconocimientos;

public interface IWalletService
{
    Task<WalletSaldo> ObtenerOCrearWalletAsync(string tokenColaborador);
    
    Task<WalletSaldo> ActualizarSaldoAsync(string tokenColaborador, int cantidadULIs, string descripcion, int? reconocimientoId = null);
    
    Task GenerarULIsParaReconocimientoAsync(Reconocimiento reconocimiento);

    Task<WalletSaldo> RegistrarCompraMarketplaceAsync(string tokenColaborador, int costo, string descripcion, int compraId);
    Task<WalletSaldo> ReponerSaldoPorRechazoCompraAsync(string tokenColaborador, int costo, string descripcion, int compraId);
}