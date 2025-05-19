using ReconocerApp.API.Models;
using static ReconocerApp.API.Controllers.ReconocimientosController;

namespace ReconocerApp.API.Services.Reconocimientos;

public interface IReconocimientoNotificationService
{
    Task EnviarNotificacionCreacionAsync(Reconocimiento reconocimiento, string reconocedorNombre, string reconocidoNombre, string reconocedorEmail, string reconocidoEmail);
    
    Task EnviarNotificacionesAprobacionAsync(Reconocimiento reconocimiento, ReconocimientoReviewRequest reviewRequest, string reconocedorEmail, string reconocidoEmail, string reconocedorNombre, string reconocidoNombre);
    
    Task EnviarNotificacionRechazoAsync(Reconocimiento reconocimiento, ReconocimientoReviewRequest reviewRequest, string reconocedorEmail, string reconocedorNombre, string reconocidoNombre, string reconocidoEmail);
}