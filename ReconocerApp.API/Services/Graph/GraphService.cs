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
using ReconocerApp.API.Data;
using Microsoft.EntityFrameworkCore;

namespace ReconocerApp.API.Services.Graph
{
    public class GraphService : IGraphService
    {
        private readonly ILogger<GraphService> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly ApplicationDbContext _dbContext;

        public GraphService(ILogger<GraphService> logger, IConfiguration configuration, HttpClient httpClient, ApplicationDbContext dbContext)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = httpClient;
            _dbContext = dbContext;
        }

        public async Task<UserGraphInfo> GetUserInfoAsync(string userId)
        {
            try
            {
                // Buscar en caché
                var cached = await _dbContext.CachedUserGraphInfos.FirstOrDefaultAsync(u => u.UserId == userId);
                if (cached != null && cached.LastUpdated > DateTime.UtcNow.AddDays(-1))
                {
                    return new UserGraphInfo
                    {
                        Id = cached.UserId,
                        DisplayName = cached.DisplayName,
                        Email = cached.Email,
                        JobTitle = cached.JobTitle,
                        Department = cached.Department,
                        ProfilePhotoBase64 = cached.ProfilePhotoBase64
                    };
                }

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
                    .ExecuteAsync()!;

                var accessToken = result.AccessToken!;

                if (string.IsNullOrEmpty(accessToken))
                {
                    throw new Exception("No se pudo obtener el token de acceso de Azure AD.");
                }

                // Create Graph client with the ClientSecretCredential
                var tokenCredential = new ClientSecretCredential(
                    tenantId,
                    clientId,
                    clientSecret
                );

                var graphClient = new GraphServiceClient(tokenCredential, scopes);

                // Get user details - using the updated SDK syntax
                var user = await graphClient.Users[userId].GetAsync();
                if (user == null)
                {
                    throw new Exception($"No se encontró el usuario {userId} en Microsoft Graph.");
                }

                // Initialize user info
                var userInfo = new UserGraphInfo
                {
                    Id = user.Id ?? string.Empty,
                    DisplayName = user.DisplayName ?? string.Empty,
                    Email = user.Mail ?? user.UserPrincipalName ?? string.Empty,
                    JobTitle = user.JobTitle ?? string.Empty,
                    Department = user.Department ?? string.Empty,
                    ProfilePhotoBase64 = string.Empty // No photo retrieval, set ProfilePhotoBase64 to empty
                };

                // Guardar/actualizar caché
                if (cached == null)
                {
                    cached = new CachedUserGraphInfo
                    {
                        UserId = userInfo.Id ?? string.Empty,
                        DisplayName = userInfo.DisplayName ?? string.Empty,
                        Email = userInfo.Email ?? string.Empty,
                        JobTitle = userInfo.JobTitle ?? string.Empty,
                        Department = userInfo.Department ?? string.Empty,
                        ProfilePhotoBase64 = userInfo.ProfilePhotoBase64 ?? string.Empty,
                        LastUpdated = DateTime.UtcNow
                    };
                    _dbContext.CachedUserGraphInfos.Add(cached);
                }
                else
                {
                    cached.DisplayName = userInfo.DisplayName ?? string.Empty;
                    cached.Email = userInfo.Email ?? string.Empty;
                    cached.JobTitle = userInfo.JobTitle ?? string.Empty;
                    cached.Department = userInfo.Department ?? string.Empty;
                    cached.ProfilePhotoBase64 = userInfo.ProfilePhotoBase64 ?? string.Empty;
                    cached.LastUpdated = DateTime.UtcNow;
                    _dbContext.CachedUserGraphInfos.Update(cached);
                }
                await _dbContext.SaveChangesAsync();

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
