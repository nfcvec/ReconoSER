using System.Net;
using System.Net.Mail;
using MailKit.Security;
using MimeKit;

namespace ReconocerApp.API.Services.Notifications
{
    public class EmailNotificationService : IEmailNotificationService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailNotificationService> _logger;
        private readonly SmtpSettings _smtpSettings;

        public EmailNotificationService(IConfiguration configuration, ILogger<EmailNotificationService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _smtpSettings = LoadSmtpSettings();
        }

        public Task SendEmailAsync(string from, string to, string subject, string body)
        {
            try
            {
                _logger.LogInformation($"Sending email to {to} with subject: {subject}");

                // Create email message
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("", from));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;
                message.Body = new BodyBuilder { HtmlBody = body }.ToMessageBody();

                // Send email in background (fire-and-forget)
                Task.Run(() => SendWithMailKitAsync(message));

                _logger.LogInformation("Email send triggered (not awaited)");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to trigger email send");
                throw new ApplicationException("Email sending failed: " + ex.Message, ex);
            }
            return Task.CompletedTask;
        }

        public async Task SendWithMailKitAsync(MimeMessage message)
        {
            using var client = new MailKit.Net.Smtp.SmtpClient();
            client.Timeout = 30000; // 30 seconds timeout
            
            // Determine the appropriate security option based on port
            var secureOption = DetermineSecureOption();
            
            _logger.LogInformation($"Connecting to {_smtpSettings.Server}:{_smtpSettings.Port} using {secureOption}");
            
            try
            {
                await client.ConnectAsync(_smtpSettings.Server, _smtpSettings.Port, secureOption);
                
                if (!string.IsNullOrEmpty(_smtpSettings.Username) && !string.IsNullOrEmpty(_smtpSettings.Password))
                {
                    await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
                }

                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during SMTP operation");
                throw;
            }
        }
        
        private SecureSocketOptions DetermineSecureOption()
        {
            return _smtpSettings.Port == 465 
                ? SecureSocketOptions.SslOnConnect 
                : _smtpSettings.EnableSsl 
                    ? SecureSocketOptions.StartTls 
                    : SecureSocketOptions.None;
        }
        
        private SmtpSettings LoadSmtpSettings()
        {
            try
            {
                return new SmtpSettings
                {
                    Server = _configuration["Email:SmtpServer"] ?? throw new ArgumentException("SMTP server configuration is missing"),
                    Port = int.Parse(_configuration["Email:Port"] ?? "0"),
                    Username = _configuration["Email:Username"],
                    Password = _configuration["Email:Password"],
                    EnableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "false")
                };
            }
            catch (FormatException ex)
            {
                _logger.LogError(ex, "Invalid email configuration format");
                throw new ApplicationException("Email service misconfigured: " + ex.Message, ex);
            }
        }
        
        private class SmtpSettings
        {
            public string Server { get; set; } = string.Empty;
            public int Port { get; set; }
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public bool EnableSsl { get; set; }
        }
    }
}