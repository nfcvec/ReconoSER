using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using ReconocerApp.API.Controllers.Base;
using ReconocerApp.API.Data;
using ReconocerApp.API.Models;
using ReconocerApp.API.Models.Responses;
using System.Text.Json;
using ReconocerApp.API.Models.Filters;
using ReconocerApp.API.Services.Filtering;
using System.Linq.Dynamic.Core;

namespace ReconocerApp.API.Controllers;

public class InventarioTransaccionesController : BaseCrudController<InventarioTransaccion, InventarioTransaccionResponse, int>
{
    public InventarioTransaccionesController(ApplicationDbContext context, IMapper mapper, IDynamicFilterService filterService)
        : base(context, mapper, filterService) { }

    public override async Task<ActionResult<IEnumerable<InventarioTransaccionResponse>>> GetAll(
        [FromQuery] string? filters = null,
        [FromQuery] string? orderBy = null,
        [FromQuery] string? orderDirection = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
    )
    {
        var baseQuery = _context.InventarioTransacciones
            .Include(t => t.Premio)
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
        return Ok(_mapper.Map<List<InventarioTransaccionResponse>>(items));
    }

    public override async Task<ActionResult<InventarioTransaccionResponse>> GetById(object id)
    {
        var item = await _context.InventarioTransacciones
            .Include(t => t.Premio)
            .FirstOrDefaultAsync(t => t.TransaccionId == (int)id);

        if (item == null) return NotFound();
        return Ok(_mapper.Map<InventarioTransaccionResponse>(item));
    }
}
