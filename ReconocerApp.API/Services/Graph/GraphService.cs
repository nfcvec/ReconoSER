using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Microsoft.Identity.Client;
using Azure.Identity;
using ReconocerApp.API.Models;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using Microsoft.Graph.Models;
using Microsoft.Kiota.Abstractions.Authentication;

namespace ReconocerApp.API.Services.Graph
{
    public class GraphService : IGraphService
    {
        private readonly ILogger<GraphService> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public GraphService(ILogger<GraphService> logger, IConfiguration configuration, HttpClient httpClient)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public async Task<UserGraphInfo> GetUserInfoAsync(string userId)
        {
            try
            {
                // Get access token
                var scopes = new[] { "https://graph.microsoft.com/.default" };
                var clientId = _configuration["AzureAd:ClientId"];
                var tenantId = _configuration["AzureAd:TenantId"];
                var clientSecret = _configuration["AzureAd:ClientSecret"];

                var confidentialClientApplication = ConfidentialClientApplicationBuilder
                    .Create(clientId)
                    .WithTenantId(tenantId)
                    .WithClientSecret(clientSecret)
                    .Build();

                var result = await confidentialClientApplication
                    .AcquireTokenForClient(scopes)
                    .ExecuteAsync();

                var accessToken = result.AccessToken;

                // Create Graph client with the ClientSecretCredential
                var tokenCredential = new ClientSecretCredential(
                    tenantId,
                    clientId,
                    clientSecret
                );

                var graphClient = new GraphServiceClient(tokenCredential, scopes);

                // Get user details - using the updated SDK syntax
                var user = await graphClient.Users[userId].GetAsync();
                
                // Initialize user info
                var userInfo = new UserGraphInfo
                {
                    Id = user.Id,
                    DisplayName = user.DisplayName,
                    Email = user.Mail ?? user.UserPrincipalName,
                    JobTitle = user.JobTitle ?? string.Empty,
                    Department = user.Department ?? string.Empty
                };

                // Try to get user photo
                try
                {
                    // Updated to use the newer SDK pattern
                    var photoStream = await graphClient.Users[userId].Photo.Content.GetAsync();
                    if (photoStream != null)
                    {
                        using (var memoryStream = new MemoryStream())
                        {
                            await photoStream.CopyToAsync(memoryStream);
                            var photoBytes = memoryStream.ToArray();
                            userInfo.ProfilePhotoBase64 = Convert.ToBase64String(photoBytes);
                        }
                    }
                }
                catch (Exception ex)
                {
                    // Photo might not exist, that's ok
                    _logger.LogWarning($"Unable to retrieve photo for user {userId}: {ex.Message}");
                }

                return userInfo;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting user info from Graph API for user {userId}");
                throw;
            }
        }
    }
}
