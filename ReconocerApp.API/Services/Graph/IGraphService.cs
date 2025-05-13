using System.Threading.Tasks;
using ReconocerApp.API.Models;

namespace ReconocerApp.API.Services.Graph
{
    public interface IGraphService
    {
        Task<UserGraphInfo> GetUserInfoAsync(string userId);
    }
}
