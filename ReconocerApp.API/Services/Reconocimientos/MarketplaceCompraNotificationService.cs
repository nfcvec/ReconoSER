using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ReconocerApp.API.Models;
using ReconocerApp.API.Services.Notifications;

namespace ReconocerApp.API.Services.Reconocimientos;

public class MarketplaceCompraNotificationService : IMarketplaceCompraNotificationService
{
    private readonly IEmailNotificationService _emailService;
    private readonly IEmailTemplateProvider _templateProvider;
    private readonly IConfiguration _configuration;
    private readonly ILogger<MarketplaceCompraNotificationService> _logger;

    public MarketplaceCompraNotificationService(
        IEmailNotificationService emailService,
        IEmailTemplateProvider templateProvider,
        IConfiguration configuration,
        ILogger<MarketplaceCompraNotificationService> logger)
    {
        _emailService = emailService;
        _templateProvider = templateProvider;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task EnviarNotificacionCreacionAsync(MarketplaceCompra compra, string colaboradorNombre, string colaboradorEmail, string premioNombre)
    {
        try
        {
            var fromAddress = _configuration["Email:FromAddress"];
            if (string.IsNullOrEmpty(fromAddress) || string.IsNullOrEmpty(colaboradorEmail))
            {
                _logger.LogWarning($"No se pudo enviar la notificación de compra: fromAddress={fromAddress}, colaboradorEmail={colaboradorEmail}");
                return;
            }

            var templateModel = new
            {
                ColaboradorNombre = colaboradorNombre,
                PremioNombre = premioNombre,
                FechaCompra = compra.FechaCompra?.ToString("dd/MM/yyyy HH:mm") ?? "",
                CompraId = compra.CompraId
            };

            string emailContent = await _templateProvider.GetProcessedTemplateAsync("MarketplaceCompraCreada", templateModel);

            await _emailService.SendEmailAsync(
                fromAddress,
                colaboradorEmail,
                "Confirmación de compra en el Marketplace",
                emailContent
            );

            _logger.LogInformation($"Email de confirmación de compra enviado a {colaboradorEmail} para la compra ID {compra.CompraId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al enviar la notificación de compra");
        }
    }

    public async Task EnviarNotificacionAprobacionAsync(MarketplaceCompra compra, string colaboradorNombre, string colaboradorEmail, string premioNombre, string comentarioAprobacion)
    {
        try
        {
            var fromAddress = _configuration["Email:FromAddress"];
            if (string.IsNullOrEmpty(fromAddress) || string.IsNullOrEmpty(colaboradorEmail))
            {
                _logger.LogWarning($"No se pudo enviar la notificación de aprobación: fromAddress={fromAddress}, colaboradorEmail={colaboradorEmail}");
                return;
            }

            bool tieneComentario = !string.IsNullOrWhiteSpace(comentarioAprobacion);
            string templateAprobado = tieneComentario ? "MarketplaceCompraAprobadaConComentario" : "MarketplaceCompraAprobadaSinComentario";

            var templateModel = new
            {
                ColaboradorNombre = colaboradorNombre,
                PremioNombre = premioNombre,
                FechaResolucion = compra.FechaResolucion?.ToString("dd/MM/yyyy HH:mm") ?? "",
                CompraId = compra.CompraId,
                ComentarioAprobacion = comentarioAprobacion
            };

            string emailContent = await _templateProvider.GetProcessedTemplateAsync(templateAprobado, templateModel);

            await _emailService.SendEmailAsync(
                fromAddress,
                colaboradorEmail,
                "¡Tu compra en el Marketplace fue aprobada!",
                emailContent
            );

            _logger.LogInformation($"Email de aprobación de compra enviado a {colaboradorEmail} para la compra ID {compra.CompraId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al enviar la notificación de aprobación de compra");
        }
    }

    public async Task EnviarNotificacionRechazoAsync(MarketplaceCompra compra, string colaboradorNombre, string colaboradorEmail, string premioNombre, string comentarioRechazo)
    {
        try
        {
            var fromAddress = _configuration["Email:FromAddress"];
            if (string.IsNullOrEmpty(fromAddress) || string.IsNullOrEmpty(colaboradorEmail))
            {
                _logger.LogWarning($"No se pudo enviar la notificación de rechazo: fromAddress={fromAddress}, colaboradorEmail={colaboradorEmail}");
                return;
            }

            bool tieneComentario = !string.IsNullOrWhiteSpace(comentarioRechazo);
            string templateRechazo = tieneComentario ? "MarketplaceCompraRechazadaConComentario" : "MarketplaceCompraRechazadaSinComentario";

            var templateModel = new
            {
                ColaboradorNombre = colaboradorNombre,
                PremioNombre = premioNombre,
                FechaResolucion = compra.FechaResolucion?.ToString("dd/MM/yyyy HH:mm") ?? "",
                CompraId = compra.CompraId,
                ComentarioRechazo = comentarioRechazo
            };

            string emailContent = await _templateProvider.GetProcessedTemplateAsync(templateRechazo, templateModel);

            await _emailService.SendEmailAsync(
                fromAddress,
                colaboradorEmail,
                "Actualización sobre tu compra en el Marketplace",
                emailContent
            );

            _logger.LogInformation($"Email de rechazo de compra enviado a {colaboradorEmail} para la compra ID {compra.CompraId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al enviar la notificación de rechazo de compra");
        }
    }
}
