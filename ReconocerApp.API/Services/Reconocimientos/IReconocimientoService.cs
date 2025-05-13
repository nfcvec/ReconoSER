using ReconocerApp.API.Models;
using ReconocerApp.API.Models.Responses;
using ReconocerApp.API.Controllers;
using static ReconocerApp.API.Controllers.ReconocimientosController;

namespace ReconocerApp.API.Services.Reconocimientos;

public interface IReconocimientoService
{
    Task<(List<Reconocimiento> Items, int TotalCount)> GetReconocimientosAsync(
        string? filters = null,
        string? orderBy = null,
        string? orderDirection = null,
        int page = 1,
        int pageSize = 10
    );
    
    Task<Reconocimiento?> GetReconocimientoByIdAsync(int id);
    
    Task<Reconocimiento> CreateReconocimientoAsync(Reconocimiento reconocimiento);
    
    Task<Reconocimiento> UpdateReconocimientoAsync(int id, Reconocimiento reconocimiento);
    
    Task DeleteReconocimientoAsync(int id);
    
    Task<Reconocimiento> ReviewReconocimientoAsync(int reconocimientoId, ReconocimientoReviewRequest reviewRequest);
}