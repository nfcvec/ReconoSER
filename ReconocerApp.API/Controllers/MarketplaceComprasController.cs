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
using ReconocerApp.API.Services.Reconocimientos;
using ReconocerApp.API.Services.Graph;

namespace ReconocerApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MarketplaceComprasController : ControllerBase
{
    protected readonly ApplicationDbContext _context;
    protected readonly IMapper _mapper;
    protected readonly DbSet<MarketplaceCompra> _dbSet;
    protected readonly IDynamicFilterService _filterService;
    private readonly IWalletService _walletService;
    private readonly IGraphService _graphService;
    private readonly IMarketplaceCompraNotificationService _notificationService;

    public MarketplaceComprasController(ApplicationDbContext context, IMapper mapper, IDynamicFilterService filterService, IWalletService walletService, IGraphService graphService, IMarketplaceCompraNotificationService notificationService)
    {
        _context = context;
        _mapper = mapper;
        _dbSet = _context.Set<MarketplaceCompra>();
        _filterService = filterService;
        _walletService = walletService;
        _graphService = graphService;
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MarketplaceCompraResponse>>> GetAll(
        [FromQuery] string? filters = null,
        [FromQuery] string? orderBy = null,
        [FromQuery] string? orderDirection = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
    )
    {
        var baseQuery = _context.MarketplaceCompras
            .Include(c => c.Premio)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filters))
        {
            List<FilterRequest> parsedFilters;
            try
            {
                parsedFilters = JsonSerializer.Deserialize<List<FilterRequest>>(filters) ?? new();
            }
            catch
            {
                return BadRequest("Invalid filters format.");
            }

            baseQuery = _filterService.ApplyFilters(baseQuery, parsedFilters);
        }

        if (!string.IsNullOrEmpty(orderBy))
        {
            baseQuery = _filterService.ApplySorting(baseQuery, orderBy, orderDirection ?? "asc");
        }

        var totalItems = await baseQuery.CountAsync();
        var items = await baseQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        Response.Headers["X-Total-Count"] = totalItems.ToString();
        return Ok(_mapper.Map<List<MarketplaceCompraResponse>>(items));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MarketplaceCompraResponse>> GetById(int id)
    {
        var item = await _context.MarketplaceCompras
            .Include(c => c.Premio)
            .FirstOrDefaultAsync(c => c.CompraId == id);

        if (item == null) return NotFound();
        return Ok(_mapper.Map<MarketplaceCompraResponse>(item));
    }

    [HttpPost]
    public async Task<ActionResult<MarketplaceCompraResponse>> Create([FromBody] MarketplaceCompra entity)
    {
        if (entity.FechaCompra.HasValue)
            entity.FechaCompra = DateTime.SpecifyKind(entity.FechaCompra.Value, DateTimeKind.Utc);
        if (entity.FechaResolucion.HasValue)
            entity.FechaResolucion = DateTime.SpecifyKind(entity.FechaResolucion.Value, DateTimeKind.Utc);
        foreach (var entry in _context.Entry(entity).References)
        {
            if (entry.TargetEntry != null)
            {
                entry.TargetEntry.State = EntityState.Unchanged;
            }
        }
        _dbSet.Add(entity);
        await _context.SaveChangesAsync();
        // Descontar saldo al crear la compra
        var premio = await _context.MarketplacePremios.FirstOrDefaultAsync(p => p.PremioId == entity.PremioId);
        if (premio != null && !string.IsNullOrEmpty(entity.TokenColaborador))
        {
            string descripcion = $"Compra de premio #{premio.PremioId}: {premio.Nombre}";
            await _walletService.RegistrarCompraMarketplaceAsync(entity.TokenColaborador, premio.CostoWallet, descripcion, entity.CompraId);

            // Obtener datos del colaborador desde Graph
            var colaboradorInfo = await _graphService.GetUserInfoAsync(entity.TokenColaborador);
            var colaboradorNombre = colaboradorInfo?.DisplayName ?? "Colaborador";
            var colaboradorEmail = colaboradorInfo?.Email ?? string.Empty;
            // Notificar por email
            await _notificationService.EnviarNotificacionCreacionAsync(entity, colaboradorNombre, colaboradorEmail, premio.Nombre);
        }
        return Ok(_mapper.Map<MarketplaceCompraResponse>(entity));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] MarketplaceCompra entity)
    {
        if (entity.FechaCompra.HasValue)
            entity.FechaCompra = DateTime.SpecifyKind(entity.FechaCompra.Value, DateTimeKind.Utc);
        if (entity.FechaResolucion.HasValue)
            entity.FechaResolucion = DateTime.SpecifyKind(entity.FechaResolucion.Value, DateTimeKind.Utc);

        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var item = await _dbSet.FindAsync(id);
        if (item == null) return NotFound();
        _dbSet.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    public class CompraReviewRequest
    {
        public bool Aprobar { get; set; }
        public string ComentarioRevision { get; set; } = string.Empty;
        public string AprobadorId { get; set; } = string.Empty;
        public DateTime FechaResolucion { get; set; } = DateTime.UtcNow;

    }

    [HttpPost("review/{compraId}")]
    public async Task<IActionResult> Review([FromRoute] int compraId, [FromBody] CompraReviewRequest request)
    {
        var aprobar = request.Aprobar;
        var item = await _dbSet.FindAsync(compraId);
        if (item == null) return NotFound();
        var premio = await _context.MarketplacePremios.FirstOrDefaultAsync(p => p.PremioId == item.PremioId);
        if (premio == null) return NotFound("El premio asociado a la compra no existe.");
        if (request.Aprobar)
        {
            item.Estado = "aprobado";
        }
        else
        {
            // Reponer saldo si se rechaza
            if (!string.IsNullOrEmpty(item.TokenColaborador))
            {
                string descripcion = $"Reposición por rechazo de compra #{item.CompraId} de premio {premio.Nombre}";
                await _walletService.ReponerSaldoPorRechazoCompraAsync(item.TokenColaborador, premio.CostoWallet, descripcion, item.CompraId);
            }
            item.Estado = "rechazado";
        }
        item.ComentarioRevision = request.ComentarioRevision;
        item.AprobadorId = request.AprobadorId;
        item.FechaResolucion = DateTime.UtcNow;
        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        // Notificación por email usando datos de Graph
        if (!string.IsNullOrEmpty(item.TokenColaborador))
        {
            var colaboradorInfo = await _graphService.GetUserInfoAsync(item.TokenColaborador);
            var colaboradorNombre = colaboradorInfo?.DisplayName ?? "Colaborador";
            var colaboradorEmail = colaboradorInfo?.Email ?? string.Empty;
            if (request.Aprobar)
            {
                await _notificationService.EnviarNotificacionAprobacionAsync(item, colaboradorNombre, colaboradorEmail, premio.Nombre, request.ComentarioRevision);
            }
            else
            {
                await _notificationService.EnviarNotificacionRechazoAsync(item, colaboradorNombre, colaboradorEmail, premio.Nombre, request.ComentarioRevision);
            }
        }
        return NoContent();
    }
}
