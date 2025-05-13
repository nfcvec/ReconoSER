using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using ReconocerApp.API.Data;
using ReconocerApp.API.Services.Filtering;
using ReconocerApp.API.Models.Filters;
using System.Text.Json;

namespace ReconocerApp.API.Controllers.Base;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseCrudController<TEntity, TResponse, TKey> : ControllerBase
    where TEntity : class
    where TResponse : class
{
    protected readonly ApplicationDbContext _context;
    protected readonly IMapper _mapper;
    protected readonly DbSet<TEntity> _dbSet;
    protected readonly IDynamicFilterService _filterService;

    protected BaseCrudController(ApplicationDbContext context, IMapper mapper, IDynamicFilterService filterService)
    {
        _context = context;
        _mapper = mapper;
        _dbSet = _context.Set<TEntity>();
        _filterService = filterService;
    }

    // Constructor alternativo para mantener compatibilidad con los controladores existentes
    protected BaseCrudController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
        _dbSet = _context.Set<TEntity>();
        // _filterService estará nulo, lo que podría causar NullReferenceException
        // Esto debería ser reemplazado en todos los controladores
    }

    [HttpGet]
    public virtual async Task<ActionResult<IEnumerable<TResponse>>> GetAll(
        [FromQuery] string? filters = null,
        [FromQuery] string? orderBy = null,
        [FromQuery] string? orderDirection = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100
    )
    {
        var query = _dbSet.AsQueryable();
        
        // Aplicar filtros si es posible
        if (!string.IsNullOrEmpty(filters) && _filterService != null)
        {
            try
            {
                var parsedFilters = JsonSerializer.Deserialize<List<FilterRequest>>(filters);
                if (parsedFilters != null)
                {
                    query = _filterService.ApplyFilters(query, parsedFilters);
                }
            }
            catch (Exception)
            {
                return BadRequest("Invalid filters format.");
            }
        }
        
        // Aplicar ordenamiento si es posible
        if (!string.IsNullOrEmpty(orderBy) && _filterService != null)
        {
            query = _filterService.ApplySorting(query, orderBy, orderDirection ?? "asc");
        }
        
        // Contar items y aplicar paginación
        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        Response.Headers["X-Total-Count"] = totalItems.ToString();
        return Ok(_mapper.Map<List<TResponse>>(items));
    }

    [HttpGet("{id}")]
    public virtual async Task<ActionResult<TResponse>> GetById(object id)
    {
        var item = await _dbSet.FindAsync(id);
        if (item == null) return NotFound();
        return Ok(_mapper.Map<TResponse>(item));
    }

    [HttpPost]
    public virtual async Task<ActionResult<TResponse>> Create([FromBody] TEntity entity)
    {
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
        return Ok(_mapper.Map<TResponse>(entity));
    }

    [HttpPut("{id}")]
    public virtual async Task<IActionResult> Update([FromRoute] object id, [FromBody] TEntity entity)
    {
        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public virtual async Task<IActionResult> Delete([FromRoute] TKey id)
    {
        var item = await _dbSet.FindAsync(id);
        if (item == null) return NotFound();
        _dbSet.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
