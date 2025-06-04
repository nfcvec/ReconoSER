using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ReconocerApp.API.Models;
using ReconocerApp.API.Services.Notifications;
using static ReconocerApp.API.Controllers.ReconocimientosController;

namespace ReconocerApp.API.Services.Reconocimientos;

public class ReconocimientoNotificationService : IReconocimientoNotificationService
{
    private readonly IEmailNotificationService _emailService;
    private readonly IEmailTemplateProvider _templateProvider;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ReconocimientoNotificationService> _logger;

    public ReconocimientoNotificationService(
        IEmailNotificationService emailService,
        IEmailTemplateProvider templateProvider,
        IConfiguration configuration,
        ILogger<ReconocimientoNotificationService> logger)
    {
        _emailService = emailService;
        _templateProvider = templateProvider;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task EnviarNotificacionCreacionAsync(
        Reconocimiento reconocimiento,
        string reconocedorNombre,
        string reconocidoNombre,
        string reconocidoEmail,
        string reconocedorEmail)
    {
        try
        {
            var fromAddress = _configuration["Email:FromAddress"];
            if (string.IsNullOrEmpty(fromAddress) || string.IsNullOrEmpty(reconocedorEmail))
            {
                _logger.LogWarning($"No se pudo enviar la notificación de creación: fromAddress={fromAddress}, reconocedorEmail={reconocedorEmail}");
                return;
            }

            // Modelo para el email
            var templateModel = new
            {
                ReconocedorNombre = reconocedorNombre,
                ReconocidoNombre = reconocidoNombre,
                ReconocidoEmail = reconocidoEmail,
                FechaCreacion = DateTime.Now.ToString("dd/MM/yyyy HH:mm"),
                ReconocimientoId = reconocimiento.ReconocimientoId
            };

            // Obtener el contenido del email procesado
            string emailContent = await _templateProvider.GetProcessedTemplateAsync("ReconocimientoCreado", templateModel);

            // Enviar el correo
            await _emailService.SendEmailAsync(
                fromAddress,
                reconocedorEmail,
                "Confirmación de solicitud de reconocimiento",
                emailContent
            );

            _logger.LogInformation($"Email de confirmación enviado a {reconocedorEmail} para el reconocimiento ID {reconocimiento.ReconocimientoId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al enviar la notificación de creación de reconocimiento");
        }
    }

    public async Task EnviarNotificacionesAprobacionAsync(
        Reconocimiento reconocimiento,
        ReconocimientoReviewRequest reviewRequest,
        string reconocedorEmail,
        string reconocidoEmail,
        string reconocedorNombre,
        string reconocidoNombre)
    {
        try
        {
            var fromAddress = _configuration["Email:FromAddress"];
            if (string.IsNullOrEmpty(fromAddress))
            {
                _logger.LogWarning("FromAddress no está configurado en la aplicación");
                return;
            }

            bool tieneComentario = !string.IsNullOrWhiteSpace(reviewRequest.ComentarioAprobacion);
            string templateAprobado = tieneComentario ? "ReconocimientoAprobadoConComentario" : "ReconocimientoAprobadoSinComentario";

            // Correo al reconocedor
            if (!string.IsNullOrEmpty(reconocedorEmail))
            {
                var reconocedorModel = new
                {
                    Nombre = reconocedorNombre,
                    ReconocedorNombre = reconocedorNombre,
                    ReconocedorEmail = reconocedorEmail,
                    ReconocidoNombre = reconocidoNombre,
                    ReconocidoEmail = reconocidoEmail,
                    FechaResolucion = reviewRequest.FechaResolucion.ToString("dd/MM/yyyy HH:mm"),
                    ReconocimientoId = reconocimiento.ReconocimientoId,
                    ComentarioAprobacion = reviewRequest.ComentarioAprobacion,
                    ReconocedorFrase = $"que enviaste a <strong>{reconocidoNombre}</strong>"
                };

                try
                {
                    string reconocedorEmailContent = await _templateProvider.GetProcessedTemplateAsync(
                        templateAprobado,
                        reconocedorModel);

                    await _emailService.SendEmailAsync(
                        fromAddress,
                        reconocedorEmail,
                        "Solicitud Aprobada - ReconoSER",
                        reconocedorEmailContent
                    );

                    _logger.LogInformation($"Email de aprobación enviado al reconocedor {reconocedorEmail} para el reconocimiento ID {reconocimiento.ReconocimientoId}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error al enviar email de aprobación al reconocedor {reconocedorEmail}");
                }
            }

            // Correo al reconocido
            if (!string.IsNullOrEmpty(reconocidoEmail))
            {
                var reconocidoModel = new
                {
                    Nombre = reconocidoNombre,
                    ReconocedorNombre = reconocedorNombre,
                    ReconocedorEmail = reconocedorEmail,
                    ReconocidoNombre = reconocidoNombre,
                    ReconocidoEmail = reconocidoEmail,
                    FechaResolucion = reviewRequest.FechaResolucion.ToString("dd/MM/yyyy HH:mm"),
                    ReconocimientoId = reconocimiento.ReconocimientoId,
                    ComentarioAprobacion = reviewRequest.ComentarioAprobacion,
                    ReconocedorFrase = $"que recibiste de <strong>{reconocedorNombre}</strong>"
                };

                try
                {
                    string reconocidoEmailContent = await _templateProvider.GetProcessedTemplateAsync(
                        templateAprobado,
                        reconocidoModel);

                    await _emailService.SendEmailAsync(
                        fromAddress,
                        reconocidoEmail,
                        "¡Has recibido un reconocimiento!",
                        reconocidoEmailContent
                    );

                    _logger.LogInformation($"Email de aprobación enviado al reconocido {reconocidoEmail} para el reconocimiento ID {reconocimiento.ReconocimientoId}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error al enviar email de aprobación al reconocido {reconocidoEmail}");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al enviar notificaciones de aprobación");
        }
    }

    public async Task EnviarNotificacionRechazoAsync(
        Reconocimiento reconocimiento,
        ReconocimientoReviewRequest reviewRequest,
        string reconocedorEmail,
        string reconocedorNombre,
        string reconocidoNombre,
        string reconocidoEmail)
    {
        try
        {
            var fromAddress = _configuration["Email:FromAddress"];
            if (string.IsNullOrEmpty(fromAddress) || string.IsNullOrEmpty(reconocedorEmail))
            {
                _logger.LogWarning($"No se pudo enviar la notificación de rechazo: fromAddress={fromAddress}, reconocedorEmail={reconocedorEmail}");
                return;
            }

            bool tieneComentario = !string.IsNullOrWhiteSpace(reviewRequest.ComentarioAprobacion);
            string templateRechazo = tieneComentario ? "ReconocimientoRechazadoConComentario" : "ReconocimientoRechazadoSinComentario";

            var templateModel = new
            {
                ReconocedorNombre = reconocedorNombre,
                ReconocidoNombre = reconocidoNombre,
                ReconocidoEmail = reconocidoEmail,
                FechaResolucion = reviewRequest.FechaResolucion.ToString("dd/MM/yyyy HH:mm"),
                ReconocimientoId = reconocimiento.ReconocimientoId,
                ComentarioAprobacion = reviewRequest.ComentarioAprobacion
            };

            string emailContent = await _templateProvider.GetProcessedTemplateAsync(
                templateRechazo,
                templateModel);

            await _emailService.SendEmailAsync(
                fromAddress,
                reconocedorEmail,
                "Actualización sobre tu solicitud de reconocimiento",
                emailContent
            );

            _logger.LogInformation($"Email de rechazo enviado a {reconocedorEmail} para el reconocimiento ID {reconocimiento.ReconocimientoId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al enviar email de rechazo a {reconocedorEmail}");
        }
    }
}