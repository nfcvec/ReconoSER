using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Azure.Identity;
using Microsoft.Graph.Models;
using MimeKit;

namespace ReconocerApp.API.Services.Notifications
{
    public class GraphEmailNotificationService : IEmailNotificationService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<GraphEmailNotificationService> _logger;
        private readonly GraphEmailSettings _settings;
        private readonly GraphServiceClient _graphClient;

        public GraphEmailNotificationService(IConfiguration configuration, ILogger<GraphEmailNotificationService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _settings = LoadSettings();
            var credential = new ClientSecretCredential(_settings.TenantId, _settings.ClientId, _settings.ClientSecret);
            _graphClient = new GraphServiceClient(credential);
        }

        public async Task SendEmailAsync(string from, string to, string subject, string body)
        {
            try
            {
                _logger.LogInformation($"Sending email via Graph to {to} with subject: {subject}");
                var message = new Message
                {
                    Subject = subject,
                    Body = new ItemBody
                    {
                        ContentType = BodyType.Html,
                        Content = body
                    },
                    ToRecipients = new List<Recipient>
                    {
                        new Recipient { EmailAddress = new EmailAddress { Address = to } }
                    }
                };
                var sendMailRequest = new Microsoft.Graph.Users.Item.SendMail.SendMailPostRequestBody
                {
                    Message = message,
                    SaveToSentItems = true
                };
                await _graphClient.Users[_settings.UserId].SendMail.PostAsync(sendMailRequest);
                _logger.LogInformation("Email sent via Graph.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email via Graph");
                throw new ApplicationException("Graph email sending failed: " + ex.Message, ex);
            }
        }

        // Not implemented for Graph
        public Task SendWithMailKitAsync(MimeMessage message)
        {
            throw new NotImplementedException("SendWithMailKitAsync is not supported in GraphEmailNotificationService.");
        }

        private GraphEmailSettings LoadSettings()
        {
            return new GraphEmailSettings
            {
                TenantId = _configuration["GraphEmail:TenantId"] ?? throw new ArgumentException("GraphEmail:TenantId missing"),
                ClientId = _configuration["GraphEmail:ClientId"] ?? throw new ArgumentException("GraphEmail:ClientId missing"),
                ClientSecret = _configuration["GraphEmail:ClientSecret"] ?? throw new ArgumentException("GraphEmail:ClientSecret missing"),
                UserId = _configuration["GraphEmail:UserId"] ?? throw new ArgumentException("GraphEmail:UserId missing")
            };
        }

        private class GraphEmailSettings
        {
            public string TenantId { get; set; } = string.Empty;
            public string ClientId { get; set; } = string.Empty;
            public string ClientSecret { get; set; } = string.Empty;
            public string UserId { get; set; } = string.Empty;
        }
    }
}
