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

public class ComportamientosController : BaseCrudController<Comportamiento, ComportamientoResponse>
{
    public ComportamientosController(ApplicationDbContext context, IMapper mapper)
        : base(context, mapper) { }

    public override async Task<ActionResult<IEnumerable<ComportamientoResponse>>> GetAll(
        [FromQuery] string? filters = null,
        [FromQuery] string? orderBy = null,
        [FromQuery] string? orderDirection = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
    )
    {
        var baseQuery = _context.Comportamientos
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

            foreach (var filter in parsedFilters)
            {
                Console.WriteLine($"Field: {filter.Field}, Operator: {filter.Operator}, Value: {filter.Value}");
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
        return Ok(_mapper.Map<List<ComportamientoResponse>>(items));
    }

    public override async Task<ActionResult<ComportamientoResponse>> GetById(object id)
    {
        var item = await _context.Comportamientos
            .Include(c => c.Organizacion)
            .FirstOrDefaultAsync(c => c.ComportamientoId == (int)id);

        if (item == null) return NotFound();
        return Ok(_mapper.Map<ComportamientoResponse>(item));
    }
}
