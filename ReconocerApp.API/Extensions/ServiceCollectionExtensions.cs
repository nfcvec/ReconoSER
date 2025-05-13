using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ReconocerApp.API.Data;
using ReconocerApp.API.Middleware;
using ReconocerApp.API.Services;
using ReconocerApp.API.Services.Filtering;
using ReconocerApp.API.Services.Graph;
using ReconocerApp.API.Services.Notifications;
using ReconocerApp.API.Services.Reconocimientos;

namespace ReconocerApp.API.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlite(connectionString);
            });

            return services;
        }

        public static IServiceCollection AddNotificationServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<EmailConfiguration>(configuration.GetSection("EmailSettings"));
            services.AddScoped<IEmailNotificationService, EmailNotificationService>();
            return services;
        }

        public static IServiceCollection AddCustomServices(this IServiceCollection services)
        {
            // Graph Service
            services.AddScoped<IGraphService, GraphService>();
            
            // Email Services
            services.AddScoped<IEmailNotificationService, EmailNotificationService>();
            services.AddScoped<IEmailTemplateProvider, EmailTemplateProvider>();
            
            // Dynamic Filtering
            services.AddScoped<IDynamicFilterService, DynamicFilterService>();
            
            // Reconocimientos Services
            services.AddScoped<IReconocimientoService, ReconocimientoService>();
            services.AddScoped<IWalletService, WalletService>();
            services.AddScoped<IReconocimientoNotificationService, ReconocimientoNotificationService>();

            // Minio service
            services.AddScoped<MinioService>();

            return services;
        }
    }
}