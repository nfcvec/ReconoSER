using System.Threading.Tasks;
using MimeKit;

namespace ReconocerApp.API.Services.Notifications
{
    public interface IEmailNotificationService
    {
        Task SendEmailAsync(string from, string to, string subject, string body);
        Task SendWithMailKitAsync(MimeMessage message);
    }
}