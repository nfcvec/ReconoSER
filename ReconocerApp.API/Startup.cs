using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ReconocerApp.API.Services.Notifications;

namespace ReconocerApp.API
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddScoped<IEmailNotificationService, EmailNotificationService>();
            services.AddScoped<IEmailTemplateProvider, EmailTemplateProvider>(provider =>
                new EmailTemplateProvider(
                    provider.GetRequiredService<IWebHostEnvironment>(),
                    provider.GetRequiredService<ILogger<EmailTemplateProvider>>(),
                    provider.GetRequiredService<IConfiguration>()
                )
            );
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}