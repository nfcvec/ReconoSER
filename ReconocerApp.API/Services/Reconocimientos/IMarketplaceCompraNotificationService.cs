using ReconocerApp.API.Models;

namespace ReconocerApp.API.Services.Reconocimientos;

public interface IMarketplaceCompraNotificationService
{
    Task EnviarNotificacionCreacionAsync(MarketplaceCompra compra, string colaboradorNombre, string colaboradorEmail, string premioNombre);
    Task EnviarNotificacionAprobacionAsync(MarketplaceCompra compra, string colaboradorNombre, string colaboradorEmail, string premioNombre, string comentarioAprobacion);
    Task EnviarNotificacionRechazoAsync(MarketplaceCompra compra, string colaboradorNombre, string colaboradorEmail, string premioNombre, string comentarioRechazo);
}
