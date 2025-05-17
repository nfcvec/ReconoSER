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
public class ColaboradoresController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IDynamicFilterService _filterService;

    public ColaboradoresController(ApplicationDbContext context, IMapper mapper, IDynamicFilterService filterService)
    {
        _context = context;
        _mapper = mapper;
        _filterService = filterService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ColaboradorResponse>>> GetAll(
        [FromQuery] string? filters = null,
        [FromQuery] string? orderBy = null,
        [FromQuery] string? orderDirection = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
    )
    {
        var baseQuery = _context.Colaboradores
            .Include(c => c.Organizacion)
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
        return Ok(_mapper.Map<List<ColaboradorResponse>>(items));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ColaboradorResponse>> GetById([FromRoute] string id)
    {
        var item = await _context.Colaboradores
            .Include(c => c.Organizacion)
            .FirstOrDefaultAsync(c => c.ColaboradorId == id);
        if (item == null) return NotFound();
        return Ok(_mapper.Map<ColaboradorResponse>(item));
    }

    [HttpPost]
    public async Task<ActionResult<ColaboradorResponse>> Create([FromBody] Colaborador entity)
    {
        foreach (var entry in _context.Entry(entity).References)
        {
            if (entry.TargetEntry != null)
            {
                entry.TargetEntry.State = EntityState.Unchanged;
            }
        }
        _context.Colaboradores.Add(entity);
        await _context.SaveChangesAsync();
        return Ok(_mapper.Map<ColaboradorResponse>(entity));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromRoute] string id, [FromBody] Colaborador entity)
    {
        if (id != entity.ColaboradorId)
            return BadRequest("ID mismatch");
        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] string id)
    {
        var item = await _context.Colaboradores.FindAsync(id);
        if (item == null) return NotFound();
        _context.Colaboradores.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
