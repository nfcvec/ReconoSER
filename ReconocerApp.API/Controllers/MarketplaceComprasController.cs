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
public class MarketplaceComprasController : ControllerBase
{
    protected readonly ApplicationDbContext _context;
    protected readonly IMapper _mapper;
    protected readonly DbSet<MarketplaceCompra> _dbSet;

    public MarketplaceComprasController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
        _dbSet = _context.Set<MarketplaceCompra>();
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

            baseQuery = DynamicFilterService.ApplyFilters(baseQuery, parsedFilters);
        }

        if (!string.IsNullOrEmpty(orderBy))
        {
            var direction = string.Equals(orderDirection, "desc", StringComparison.OrdinalIgnoreCase) ? "descending" : "ascending";
            try
            {
                baseQuery = baseQuery.OrderBy($"{orderBy} {direction}");
            }
            catch (Exception)
            {
                return BadRequest("Invalid orderBy or orderDirection format.");
            }
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
        // Ensure all DateTime properties are in UTC
        if (entity.FechaCompra.HasValue)
            entity.FechaCompra = DateTime.SpecifyKind(entity.FechaCompra.Value, DateTimeKind.Utc);
        
        if (entity.FechaResolucion.HasValue)
            entity.FechaResolucion = DateTime.SpecifyKind(entity.FechaResolucion.Value, DateTimeKind.Utc);

        // Detectar entidades relacionadas existentes
        foreach (var entry in _context.Entry(entity).References)
        {
            if (entry.TargetEntry != null)
            {
                entry.TargetEntry.State = EntityState.Unchanged;
            }
        }

        _dbSet.Add(entity);
        await _context.SaveChangesAsync();
        return Ok(_mapper.Map<MarketplaceCompraResponse>(entity));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] MarketplaceCompra entity)
    {
        // Ensure all DateTime properties are in UTC
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
        public string ComentarioAprobacion { get; set; } = string.Empty;
        public string AprobadorId { get; set; } = string.Empty;
        public DateTime FechaResolucion { get; set; }
    }

    [HttpPost("review/{id}")]
    public async Task<IActionResult> Review([FromRoute] int id, [FromBody] CompraReviewRequest request)
    {
        var item = await _dbSet.FindAsync(id);
        if (item == null) return NotFound();

        item.Estado = request.Aprobar ? "aprobar" : "rechazar";
        item.ComentarioRevision = request.ComentarioAprobacion;
        
        // Ensure DateTime is in UTC format
        item.FechaResolucion = DateTime.SpecifyKind(request.FechaResolucion, DateTimeKind.Utc);

        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}