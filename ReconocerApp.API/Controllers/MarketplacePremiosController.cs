using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using System.Text.Json;
using System.Linq.Dynamic.Core;
using System.Linq.Dynamic.Core.Parser;
using ReconocerApp.API.Controllers.Base;
using ReconocerApp.API.Data;
using ReconocerApp.API.Models;
using ReconocerApp.API.Models.Responses;
using ReconocerApp.API.Models.Filters;
using ReconocerApp.API.Services.Filtering;
//parse exception
using System.Collections.Generic;

namespace ReconocerApp.API.Controllers;

public class MarketplacePremiosController : BaseCrudController<MarketplacePremio, MarketplacePremioResponse>
{
    public MarketplacePremiosController(ApplicationDbContext context, IMapper mapper)
        : base(context, mapper) { }

    public override async Task<ActionResult<IEnumerable<MarketplacePremioResponse>>> GetAll(
        [FromQuery] string? filters = null,
        [FromQuery] string? orderBy = null,
        [FromQuery] string? orderDirection = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
    )
    {
        var baseQuery = _context.MarketplacePremios
            .Include(p => p.Organizacion)
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
            catch (Exception) // Replaced ParseException with Exception
            {
                return BadRequest("Invalid orderBy or orderDirection format.");
            }
        }

        var totalItems = await baseQuery.CountAsync();
        var items = await baseQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<MarketplacePremioResponse>(_mapper.ConfigurationProvider)
            .ToListAsync();

        Response.Headers["X-Total-Count"] = totalItems.ToString(); // Fixed duplicate header issue
        return Ok(items);
    }

    [HttpGet("detalle/{id:int}")]
    public async Task<ActionResult<MarketplacePremioResponse>> Detalle(int id)
    {
        var entity = await _context.MarketplacePremios
            .Include(p => p.Organizacion)
            .Include(p => p.Categoria) // si estás usando categoría
            .FirstOrDefaultAsync(p => p.PremioId == id);

        if (entity == null)
            return NotFound();

        var dto = _mapper.Map<MarketplacePremioResponse>(entity);
        return Ok(dto);
    }

}
