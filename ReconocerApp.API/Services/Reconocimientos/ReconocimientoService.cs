using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ReconocerApp.API.Data;
using ReconocerApp.API.Models;
using ReconocerApp.API.Services.Graph;
using System.Linq.Dynamic.Core;
using System.Text.Json;
using ReconocerApp.API.Models.Filters;
using static ReconocerApp.API.Controllers.ReconocimientosController;

namespace ReconocerApp.API.Services.Reconocimientos;

public class ReconocimientoService : IReconocimientoService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ReconocimientoService> _logger;
    private readonly IGraphService _graphService;
    private readonly IWalletService _walletService;
    private readonly IReconocimientoNotificationService _notificationService;

    public ReconocimientoService(
        ApplicationDbContext context,
        ILogger<ReconocimientoService> logger,
        IGraphService graphService,
        IWalletService walletService,
        IReconocimientoNotificationService notificationService)
    {
        _context = context;
        _logger = logger;
        _graphService = graphService;
        _walletService = walletService;
        _notificationService = notificationService;
    }

    public async Task<(List<Reconocimiento> Items, int TotalCount)> GetReconocimientosAsync(
        string? filters = null,
        string? orderBy = null,
        string? orderDirection = null,
        int page = 1,
        int pageSize = 10)
    {
        var baseQuery = _context.Reconocimientos
            .Include(r => r.ReconocimientoComportamientos!).AsQueryable();

        // Aplicar filtros si existen
        if (!string.IsNullOrEmpty(filters))
        {
            try
            {
                var filterRequests = JsonSerializer.Deserialize<List<FilterRequest>>(filters);
                if (filterRequests != null && filterRequests.Any())
                {
                    foreach (var filter in filterRequests)
                    {
                        switch (filter.Operator.ToLower())
                        {
                            case "eq":
                                baseQuery = baseQuery.Where(r => 
                                    EF.Property<string>(r, filter.Field) == filter.Value);
                                break;
                            case "contains":
                                baseQuery = baseQuery.Where(r => 
                                    EF.Property<string>(r, filter.Field).Contains(filter.Value));
                                break;
                            case "startswith":
                                baseQuery = baseQuery.Where(r => 
                                    EF.Property<string>(r, filter.Field).StartsWith(filter.Value));
                                break;
                            case "endswith":
                                baseQuery = baseQuery.Where(r => 
                                    EF.Property<string>(r, filter.Field).EndsWith(filter.Value));
                                break;
                            case "gt":
                                baseQuery = baseQuery.Where($"{filter.Field} > @0", filter.Value);
                                break;
                            case "lt":
                                baseQuery = baseQuery.Where($"{filter.Field} < @0", filter.Value);
                                break;
                            case "gte":
                                baseQuery = baseQuery.Where($"{filter.Field} >= @0", filter.Value);
                                break;
                            case "lte":
                                baseQuery = baseQuery.Where($"{filter.Field} <= @0", filter.Value);
                                break;
                            default:
                                // Ignorar operadores no soportados
                                break;
                        }
                    }
                }
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Formato de filtro inválido: {Message}", ex.Message);
                throw new ArgumentException($"Formato de filtro inválido: {ex.Message}", nameof(filters), ex);
            }
        }

        // Aplicar ordenamiento si existe
        if (!string.IsNullOrEmpty(orderBy))
        {
            var direction = !string.IsNullOrEmpty(orderDirection) && 
                            orderDirection.Equals("desc", StringComparison.OrdinalIgnoreCase) 
                            ? "descending" 
                            : "ascending";
            
            try
            {
                baseQuery = baseQuery.OrderBy($"{orderBy} {direction}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Configuración de orden inválida: {Message}", ex.Message);
                throw new ArgumentException($"Configuración de orden inválida: {ex.Message}", nameof(orderBy), ex);
            }
        }

        // Contar total de elementos
        var totalItems = await baseQuery.CountAsync();
        
        // Aplicar paginación y ejecutar la consulta
        var reconocimientos = await baseQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Cargar los comportamientos manualmente para cada reconocimiento
        foreach (var reconocimiento in reconocimientos)
        {
            await CargarComportamientosAsync(reconocimiento);
        }

        return (reconocimientos, totalItems);
    }

    public async Task<Reconocimiento?> GetReconocimientoByIdAsync(int id)
    {
        var reconocimiento = await _context.Reconocimientos
            .Include(r => r.ReconocimientoComportamientos)
            .FirstOrDefaultAsync(r => r.ReconocimientoId == id);

        if (reconocimiento != null)
        {
            await CargarComportamientosAsync(reconocimiento);
        }

        return reconocimiento;
    }

    public async Task<Reconocimiento> CreateReconocimientoAsync(Reconocimiento reconocimiento)
    {
        try
        {
            // Obtener información de usuarios del Graph API
            var reconocidoInfo = await _graphService.GetUserInfoAsync(reconocimiento.ReconocidoId);
            var reconocedorInfo = await _graphService.GetUserInfoAsync(reconocimiento.ReconocedorId);

            // Guardar emails en variables
            var reconocidoEmail = reconocidoInfo?.Email ?? string.Empty;
            var reconocedorEmail = reconocedorInfo?.Email ?? string.Empty;
            var reconocidoNombre = reconocidoInfo?.DisplayName ?? "Usuario reconocido";
            var reconocedorNombre = reconocedorInfo?.DisplayName ?? "Usuario";

            // Guardar comportamientos para asegurar que se guarden correctamente
            var comportamientos = reconocimiento.ReconocimientoComportamientos?.ToList() ?? new List<ReconocimientoComportamiento>();
            
            // Establecer estado de cada comportamiento como sin cambios para evitar duplicados
            if (comportamientos.Any())
            {
                foreach (var rc in comportamientos)
                {
                    if (rc.Comportamiento != null)
                    {
                        _context.Entry(rc.Comportamiento).State = EntityState.Unchanged;
                    }
                }
            }

            foreach (var entry in _context.Entry(reconocimiento).References)
            {
                if (entry.TargetEntry != null)
                {
                    entry.TargetEntry.State = EntityState.Unchanged;
                }
            }

            _context.Reconocimientos.Add(reconocimiento);
            await _context.SaveChangesAsync();
            
            // Recargar la entidad con sus relaciones para asegurar que devolvemos datos completos
            var result = await _context.Reconocimientos
                .Include(r => r.ReconocimientoComportamientos)
                .FirstOrDefaultAsync(r => r.ReconocimientoId == reconocimiento.ReconocimientoId);
            
            if (result != null)
            {
                await CargarComportamientosAsync(result);
                
                // Enviar email de confirmación
                await _notificationService.EnviarNotificacionCreacionAsync(
                    result,
                    reconocedorNombre,
                    reconocidoNombre,
                    reconocidoEmail,
                    reconocedorEmail
                );
            }
                
            return result ?? reconocimiento;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear reconocimiento: {Message}", ex.Message);
            throw;
        }
    }

    public async Task<Reconocimiento> UpdateReconocimientoAsync(int id, Reconocimiento reconocimiento)
    {
        if (id != reconocimiento.ReconocimientoId)
        {
            throw new ArgumentException("El ID del reconocimiento no coincide con el ID de la URL");
        }

        _context.Entry(reconocimiento).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        
        // Devolver el reconocimiento actualizado con sus comportamientos
        var updatedReconocimiento = await _context.Reconocimientos
            .Include(r => r.ReconocimientoComportamientos)
            .FirstOrDefaultAsync(r => r.ReconocimientoId == id);
        
        if (updatedReconocimiento != null)
        {
            await CargarComportamientosAsync(updatedReconocimiento);
        }
            
        return updatedReconocimiento ?? reconocimiento;
    }

    public async Task DeleteReconocimientoAsync(int id)
    {
        var item = await _context.Reconocimientos.FindAsync(id);
        if (item == null)
        {
            throw new KeyNotFoundException($"Reconocimiento con ID {id} no encontrado");
        }
        
        _context.Reconocimientos.Remove(item);
        await _context.SaveChangesAsync();
    }

    public async Task<Reconocimiento> ReviewReconocimientoAsync(int reconocimientoId, ReconocimientoReviewRequest reviewRequest)
    {
        var reconocimiento = await _context.Reconocimientos
            .Include(r => r.ReconocimientoComportamientos)
            .FirstOrDefaultAsync(r => r.ReconocimientoId == reconocimientoId);

        if (reconocimiento == null)
        {
            throw new KeyNotFoundException($"Reconocimiento con ID {reconocimientoId} no encontrado");
        }

        // Cargar los comportamientos
        await CargarComportamientosAsync(reconocimiento);

        // Actualizar el estado del reconocimiento
        reconocimiento.Estado = reviewRequest.Aprobar ? "aprobado" : "rechazado";
        reconocimiento.AprobadorId = reviewRequest.AprobadorId;
        reconocimiento.ComentarioAprobacion = reviewRequest.ComentarioAprobacion;
        reconocimiento.FechaResolucion = reviewRequest.FechaResolucion;

        // Generar ULIs si el reconocimiento es aprobado y se solicita la generación
        if (reviewRequest.Aprobar && reviewRequest.GenerarULIs)
        {
            await _walletService.GenerarULIsParaReconocimientoAsync(reconocimiento);
        }

        _context.Reconocimientos.Update(reconocimiento);
        await _context.SaveChangesAsync();
        
        // Obtener información de usuarios para los correos
        try
        {
            var reconocidoInfo = await _graphService.GetUserInfoAsync(reconocimiento.ReconocidoId);
            var reconocedorInfo = await _graphService.GetUserInfoAsync(reconocimiento.ReconocedorId);

            var reconocidoEmail = reconocidoInfo?.Email ?? string.Empty;
            var reconocedorEmail = reconocedorInfo?.Email ?? string.Empty;
            string reconocidoNombre = reconocidoInfo?.DisplayName ?? "Usuario reconocido";
            string reconocedorNombre = reconocedorInfo?.DisplayName ?? "Usuario reconocedor";
            
            // Enviar correos según el resultado de la revisión
            if (reviewRequest.Aprobar)
            {
                await _notificationService.EnviarNotificacionesAprobacionAsync(
                    reconocimiento,
                    reviewRequest,
                    reconocedorEmail,
                    reconocidoEmail,
                    reconocedorNombre,
                    reconocidoNombre
                );
            }
            else
            {
                await _notificationService.EnviarNotificacionRechazoAsync(
                    reconocimiento,
                    reviewRequest,
                    reconocedorEmail,
                    reconocedorNombre,
                    reconocidoNombre,
                    reconocidoEmail
                );
            }
        }
        catch (Exception ex)
        {
            // Registrar el error pero no fallar la operación
            _logger.LogError(ex, "Error al enviar notificaciones para la revisión del reconocimiento");
        }

        return reconocimiento;
    }

    // Método auxiliar para cargar los comportamientos de un reconocimiento
    private async Task CargarComportamientosAsync(Reconocimiento reconocimiento)
    {
        if (reconocimiento.ReconocimientoComportamientos == null) return;
        
        foreach (var rc in reconocimiento.ReconocimientoComportamientos)
        {
            if (rc != null && rc.Comportamiento == null && rc.ComportamientoId > 0)
            {
                rc.Comportamiento = await _context.Comportamientos
                    .FirstOrDefaultAsync(c => c.ComportamientoId == rc.ComportamientoId);
            }
        }
    }
}