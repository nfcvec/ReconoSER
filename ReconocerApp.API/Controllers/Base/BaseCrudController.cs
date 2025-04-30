using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using ReconocerApp.API.Data;

namespace ReconocerApp.API.Controllers.Base;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseCrudController<TEntity, TResponse> : ControllerBase
    where TEntity : class
    where TResponse : class
{
    protected readonly ApplicationDbContext _context;
    protected readonly IMapper _mapper;
    protected readonly DbSet<TEntity> _dbSet;

    protected BaseCrudController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
        _dbSet = _context.Set<TEntity>();
    }

    [HttpGet]
    public virtual async Task<ActionResult<IEnumerable<TResponse>>> GetAll(
        [FromQuery] string? filters = null,
        [FromQuery] string? orderBy = null,
        [FromQuery] string? orderDirection = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
    )
    {
        var list = await _dbSet.ToListAsync();
        return Ok(_mapper.Map<List<TResponse>>(list));
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
    // Detectar entidades relacionadas existentes (opcionalmente podés hacer esto de manera más generalizada)
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
    public virtual async Task<IActionResult> Delete(object id)
    {
        var item = await _dbSet.FindAsync(id);
        if (item == null) return NotFound();
        _dbSet.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    
}
