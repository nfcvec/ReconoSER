
namespace ReconocerApp.API.Services.Notifications;

public interface IEmailTemplateProvider
{
    Task<string> GetProcessedTemplateAsync(string templateName, object model);
}

public class EmailTemplateProvider : IEmailTemplateProvider
{
    private readonly string _templatePath;
    private readonly ILogger<EmailTemplateProvider> _logger;

    public EmailTemplateProvider(IWebHostEnvironment environment, ILogger<EmailTemplateProvider> logger)
    {
        _templatePath = Path.Combine(environment.ContentRootPath, "Templates", "Emails");
        _logger = logger;
    }
    
    public async Task<string> GetProcessedTemplateAsync(string templateName, object model)
    {
        try
        {
            // Buscar la plantilla
            string templateFilePath = Path.Combine(_templatePath, $"{templateName}.html");
            
            if (!File.Exists(templateFilePath))
            {
                _logger.LogWarning($"Template not found: {templateFilePath}");
                return $"<p>No template found for '{templateName}'</p>";
            }
            
            string templateContent = await File.ReadAllTextAsync(templateFilePath);
            
            // Procesar la plantilla reemplazando variables
            // Esto es una implementación simple. En producción podrías usar
            // un motor de templates como Razor, Handlebars o Scriban
            if (model != null)
            {
                foreach (var prop in model.GetType().GetProperties())
                {
                    string placeholder = $"{{{{{prop.Name}}}}}";
                    string value = prop.GetValue(model)?.ToString() ?? string.Empty;
                    templateContent = templateContent.Replace(placeholder, value);
                }
            }
            
            return templateContent;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error processing template {templateName}");
            return $"<p>Error processing template: {ex.Message}</p>";
        }
    }
}