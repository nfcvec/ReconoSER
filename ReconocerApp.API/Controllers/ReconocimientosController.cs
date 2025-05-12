using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using ReconocerApp.API.Data;
using ReconocerApp.API.Models;
using ReconocerApp.API.Models.Responses;
using System.Text.Json;
using ReconocerApp.API.Models.Filters;
using ReconocerApp.API.Services.Filtering;
using System.Linq.Dynamic.Core;

namespace ReconocerApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReconocimientosController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ReconocimientosController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReconocimientoResponse>>> GetAll(
        [FromQuery] string? filters = null,
        [FromQuery] string? orderBy = null,
        [FromQuery] string? orderDirection = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
    )
    {
        var baseQuery = _context.Reconocimientos
            .Include(r => r.ReconocimientoComportamientos!).AsQueryable();

        // Aplicar filtros si existen
        if (!string.IsNullOrEmpty(filters))
        {
            try
            {
                // Los filtros vienen directamente como un string URL-encoded como:
                // [{"field":"reconocidoId","operator":"eq","value":"8721266d-8613-4093-8947-3172b499dc3c"}]
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
                return BadRequest($"Invalid filter format: {ex.Message}");
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
                return BadRequest($"Invalid order configuration: {ex.Message}");
            }
        }

        // Aplicar paginación
        var totalItems = await baseQuery.CountAsync();
        
        // Necesitamos cargar los comportamientos por separado
        var reconocimientos = await baseQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Cargar los comportamientos manualmente
        foreach (var reconocimiento in reconocimientos)
        {
            if (reconocimiento.ReconocimientoComportamientos != null)
            {
                foreach (var rc in reconocimiento.ReconocimientoComportamientos)
                {
                    if (rc != null)
                    {
                        // Cargar el comportamiento asociado si no está ya cargado
                        if (rc.Comportamiento == null && rc.ComportamientoId > 0)
                        {
                            rc.Comportamiento = await _context.Comportamientos
                                .FirstOrDefaultAsync(c => c.ComportamientoId == rc.ComportamientoId);
                        }
                    }
                }
            }
        }

        Response.Headers["X-Total-Count"] = totalItems.ToString();
        return Ok(_mapper.Map<List<ReconocimientoResponse>>(reconocimientos));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReconocimientoResponse>> GetById(int id)
    {
        var item = await _context.Reconocimientos
            .Include(r => r.ReconocimientoComportamientos)
            .FirstOrDefaultAsync(r => r.ReconocimientoId == id);

        if (item == null) return NotFound();

        // Cargar los comportamientos manualmente
        if (item.ReconocimientoComportamientos != null)
        {
            foreach (var rc in item.ReconocimientoComportamientos)
            {
                if (rc != null)
                {
                    // Cargar el comportamiento asociado si no está ya cargado
                    if (rc.Comportamiento == null && rc.ComportamientoId > 0)
                    {
                        rc.Comportamiento = await _context.Comportamientos
                            .FirstOrDefaultAsync(c => c.ComportamientoId == rc.ComportamientoId);
                    }
                }
            }
        }

        return Ok(_mapper.Map<ReconocimientoResponse>(item));
    }

    [HttpPost]
    public async Task<ActionResult<ReconocimientoResponse>> Create([FromBody] Reconocimiento reconocimiento)
    {
        // Keep track of the comportamientos to ensure they're saved properly
        var comportamientos = reconocimiento.ReconocimientoComportamientos?.ToList() ?? new List<ReconocimientoComportamiento>();
        
        // Set the state of each comportamiento to unchanged to avoid creating duplicates
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
        
        // Reload the entity with its relationships to ensure we return complete data
        var result = await _context.Reconocimientos
            .Include(r => r.ReconocimientoComportamientos)
            .FirstOrDefaultAsync(r => r.ReconocimientoId == reconocimiento.ReconocimientoId);
        
        if (result?.ReconocimientoComportamientos != null)
        {
            foreach (var rc in result.ReconocimientoComportamientos)
            {
                if (rc != null)
                {
                    // Cargar el comportamiento asociado si no está ya cargado
                    if (rc.Comportamiento == null && rc.ComportamientoId > 0)
                    {
                        rc.Comportamiento = await _context.Comportamientos
                            .FirstOrDefaultAsync(c => c.ComportamientoId == rc.ComportamientoId);
                    }
                }
            }
        }
            
        return Ok(_mapper.Map<ReconocimientoResponse>(result));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Reconocimiento reconocimiento)
    {
        if (id != reconocimiento.ReconocimientoId)
        {
            return BadRequest("ID mismatch.");
        }

        _context.Entry(reconocimiento).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        
        // Devolver el reconocimiento actualizado con sus comportamientos
        var updatedReconocimiento = await _context.Reconocimientos
            .Include(r => r.ReconocimientoComportamientos)
            .FirstOrDefaultAsync(r => r.ReconocimientoId == id);
        
        if (updatedReconocimiento?.ReconocimientoComportamientos != null)
        {
            foreach (var rc in updatedReconocimiento.ReconocimientoComportamientos)
            {
                if (rc != null)
                {
                    // Cargar el comportamiento asociado si no está ya cargado
                    if (rc.Comportamiento == null && rc.ComportamientoId > 0)
                    {
                        rc.Comportamiento = await _context.Comportamientos
                            .FirstOrDefaultAsync(c => c.ComportamientoId == rc.ComportamientoId);
                    }
                }
            }
        }
            
        return Ok(_mapper.Map<ReconocimientoResponse>(updatedReconocimiento));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Reconocimientos.FindAsync(id);
        if (item == null) return NotFound();
        _context.Reconocimientos.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    public class ReconocimientoReviewRequest
    {
        public bool Aprobar { get; set; }
        public string ComentarioAprobacion { get; set; } = string.Empty;
        public string AprobadorId { get; set; } = string.Empty;
        public bool GenerarULIs { get; set; } = false;
        public DateTime FechaResolucion { get; set; } = DateTime.UtcNow;
    }

    [HttpPost("review/{reconocimientoId}")]
    public async Task<IActionResult> ReviewReconocimiento(int reconocimientoId, [FromBody] ReconocimientoReviewRequest reviewRequest)
    {
        var reconocimiento = await _context.Reconocimientos
            .Include(r => r.ReconocimientoComportamientos)
            .FirstOrDefaultAsync(r => r.ReconocimientoId == reconocimientoId);

        if (reconocimiento == null)
        {
            return NotFound("Reconocimiento not found.");
        }

        // Cargar los comportamientos manualmente
        if (reconocimiento.ReconocimientoComportamientos != null)
        {
            foreach (var rc in reconocimiento.ReconocimientoComportamientos)
            {
                if (rc != null)
                {
                    // Cargar el comportamiento asociado si no está ya cargado
                    if (rc.Comportamiento == null && rc.ComportamientoId > 0)
                    {
                        rc.Comportamiento = await _context.Comportamientos
                            .FirstOrDefaultAsync(c => c.ComportamientoId == rc.ComportamientoId);
                    }
                }
            }
        }

        reconocimiento.Estado = reviewRequest.Aprobar ? "aprobado" : "rechazado";
        reconocimiento.AprobadorId = reviewRequest.AprobadorId;
        reconocimiento.ComentarioAprobacion = reviewRequest.ComentarioAprobacion;
        reconocimiento.FechaResolucion = reviewRequest.FechaResolucion;

        // Generar ULIs si el reconocimiento es aprobado y se solicita la generación de ULIs
        if (reviewRequest.Aprobar && reviewRequest.GenerarULIs)
        {
            await GenerarYActualizarULIs(reconocimiento);
        }

        _context.Reconocimientos.Update(reconocimiento);
        await _context.SaveChangesAsync();

        return Ok(_mapper.Map<ReconocimientoResponse>(reconocimiento));
    }

    private async Task GenerarYActualizarULIs(Reconocimiento reconocimiento)
    {
        if (reconocimiento.ReconocimientoComportamientos == null || 
            !reconocimiento.ReconocimientoComportamientos.Any()) 
            return;

        // Calcular total de ULIs a otorgar
        int totalULIs = 0;
        foreach (var rc in reconocimiento.ReconocimientoComportamientos)
        {
            if (rc?.Comportamiento != null)
            {
                totalULIs += rc.Comportamiento.WalletOtorgados;
            }
        }

        if (totalULIs <= 0) return;

        // Buscar o crear el wallet del reconocido
        var walletSaldo = await _context.WalletSaldos
            .FirstOrDefaultAsync(ws => ws.TokenColaborador == reconocimiento.ReconocidoId);

        if (walletSaldo == null)
        {
            walletSaldo = new WalletSaldo
            {
                TokenColaborador = reconocimiento.ReconocidoId,
                SaldoActual = 0
            };
            _context.WalletSaldos.Add(walletSaldo);
            await _context.SaveChangesAsync(); // Save to generate the WalletSaldoId
        }

        // Verificar que existe la categoría antes de usar su Id
        // Usando una expresión que Entity Framework puede traducir
        var categoriaReconocimientos = await _context.WalletCategorias
            .FirstOrDefaultAsync(c => c.Nombre.ToLower() == "reconocimientos" || 
                                      c.Nombre.ToLower().Contains("reconocimiento"));

        if (categoriaReconocimientos == null)
        {
            // Si no existe ninguna categoría, traer todas y verificar en memoria
            var todasCategorias = await _context.WalletCategorias.ToListAsync();
            categoriaReconocimientos = todasCategorias
                .FirstOrDefault(c => c.Nombre.Contains("reconocimiento", StringComparison.OrdinalIgnoreCase));
            
            // Si aún no se encuentra, crear una nueva
            if (categoriaReconocimientos == null)
            {
                categoriaReconocimientos = new WalletCategoria
                {
                    Nombre = "Reconocimientos",
                    Descripcion = "ULIs otorgados por reconocimientos"
                };
                _context.WalletCategorias.Add(categoriaReconocimientos);
                await _context.SaveChangesAsync(); // Guardar para obtener el ID generado
            }
        }

        // Crear la transacción usando la categoría verificada
        var transaccion = new WalletTransaccion
        {
            WalletSaldoId = walletSaldo.WalletSaldoId,
            TokenColaborador = reconocimiento.ReconocidoId,
            CategoriaId = categoriaReconocimientos.CategoriaId, // Usar el ID de la categoría existente
            Cantidad = totalULIs,
            Descripcion = $"ULIs otorgados por reconocimiento #{reconocimiento.ReconocimientoId}",
            Fecha = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
        };

        _context.WalletTransacciones.Add(transaccion);

        // Calcular el saldo total sumando todas las transacciones del usuario
        var totalSaldo = await _context.WalletTransacciones
            .Where(wt => wt.TokenColaborador == reconocimiento.ReconocidoId)
            .SumAsync(wt => wt.Cantidad) + totalULIs; // Incluir la transacción actual

        // Actualizar el saldo con el total de todas las transacciones
        walletSaldo.SaldoActual = totalSaldo;
        _context.WalletSaldos.Update(walletSaldo);

        // Los cambios se guardarán cuando se guarde el reconocimiento
    }
}
