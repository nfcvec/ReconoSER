using Microsoft.AspNetCore.Mvc;
using ReconocerApp.API.Services.Notifications;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace ReconocerApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestEmailController
    {
        private readonly IEmailNotificationService _notificationService;
        private readonly ILogger<TestEmailController> _logger;
        private readonly IConfiguration _configuration;
        private readonly IEmailTemplateProvider _templateProvider;
        
        public TestEmailController(
            IEmailNotificationService notificationService,
            ILogger<TestEmailController> logger,
            IConfiguration configuration,
            IEmailTemplateProvider templateProvider)
        {
            _notificationService = notificationService;
            _logger = logger;
            _configuration = configuration;
            _templateProvider = templateProvider;
        }
        
        [HttpPost("testEmail")]
        public async Task<IActionResult> TestEmail([FromBody] EmailTestRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Email) || 
                string.IsNullOrEmpty(request.Subject) || string.IsNullOrEmpty(request.Body))
            {
                return new BadRequestObjectResult(new { Success = false, Message = "Invalid request parameters" });
            }

            try
            {
                var fromAddress = _configuration["Email:FromAddress"];
                
                if (string.IsNullOrEmpty(fromAddress))
                {
                    return new ObjectResult(new { Success = false, Message = "FromAddress is not configured" })
                    {
                        StatusCode = 500
                    };
                }
                
                // Pass the fromAddress as the fourth parameter or as appropriate for your service implementation
                await _notificationService.SendEmailAsync(
                    fromAddress,
                    request.Email,
                    request.Subject,
                    request.Body
                );
                
                return new OkObjectResult(new { Success = true, Message = "Email sent successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending test email");
                return new ObjectResult(new { Success = false, Message = "Failed to send email", Error = ex.Message })
                {
                    StatusCode = 500
                };
            }
        }

        [HttpPost("testWelcomeEmail")]
        public async Task<IActionResult> TestWelcomeEmail([FromBody] WelcomeEmailRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Name))
            {
                return new BadRequestObjectResult(new { Success = false, Message = "Invalid request parameters" });
            }

            try
            {
                var fromAddress = _configuration["Email:FromAddress"];
                
                if (string.IsNullOrEmpty(fromAddress))
                {
                    return new ObjectResult(new { Success = false, Message = "FromAddress is not configured" })
                    {
                        StatusCode = 500
                    };
                }
                
                // Prepare the model for the template
                var templateModel = new 
                {
                    Name = request.Name,
                    Date = DateTime.Now.ToString("dd/MM/yyyy")
                };
                
                // Get the processed template content
                string emailContent = await _templateProvider.GetProcessedTemplateAsync("WelcomeUser", templateModel);
                
                // Send the email with the template content
                await _notificationService.SendEmailAsync(
                    fromAddress,
                    request.Email,
                    "¡Bienvenido a ReconocerApp!",
                    emailContent
                );
                
                return new OkObjectResult(new { Success = true, Message = "Welcome email sent successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending welcome email");
                return new ObjectResult(new { Success = false, Message = "Failed to send welcome email", Error = ex.Message })
                {
                    StatusCode = 500
                };
            }
        }
    }

    public class EmailTestRequest
    {
        public string Email { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
    }

    public class WelcomeEmailRequest
    {
        public string Email { get; set; }
        public string Name { get; set; }
    }
}