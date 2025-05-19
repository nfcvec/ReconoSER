namespace ReconocerApp.API.Services.Notifications;

public interface IEmailTemplateProvider
{
    Task<string> GetProcessedTemplateAsync(string templateName, object model);
}

public class EmailTemplateProvider : IEmailTemplateProvider
{
    private readonly string _templatePath;
    private readonly ILogger<EmailTemplateProvider> _logger;
    private readonly IConfiguration _configuration;

    public EmailTemplateProvider(IWebHostEnvironment environment, ILogger<EmailTemplateProvider> logger, IConfiguration configuration)
    {
        _templatePath = Path.Combine(environment.ContentRootPath, "Templates", "Emails");
        _logger = logger;
        _configuration = configuration;
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
            if (model != null)
            {
                foreach (var prop in model.GetType().GetProperties())
                {
                    string placeholder = $"{{{{{prop.Name}}}}}";
                    string value = prop.GetValue(model)?.ToString() ?? string.Empty;
                    templateContent = templateContent.Replace(placeholder, value);
                }
            }
            // Agregar el link de la aplicación al final del contenido antes del cierre del body
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
            string appLinkHtml = $"<div style='margin-top:30px;text-align:center;font-size:13px;color:#888;'>Accede a la aplicación aquí: <a href='{frontendUrl}'>{frontendUrl}</a></div>";
            int bodyCloseIndex = templateContent.LastIndexOf("</body>", StringComparison.OrdinalIgnoreCase);
            if (bodyCloseIndex >= 0)
            {
                templateContent = templateContent.Insert(bodyCloseIndex, appLinkHtml);
            }
            else
            {
                templateContent += appLinkHtml;
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