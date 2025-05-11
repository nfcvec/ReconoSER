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

public class ReconocimientosController : BaseCrudController<Reconocimiento, ReconocimientoResponse, int>
{

    public class ReviewRequest
    {
        public bool Aprobar { get; set; }
        public string ComentarioAprobacion { get; set; } = string.Empty;
        public string AprobadorId { get; set; } = string.Empty;
        public DateTime FechaResolucion { get; set; } = DateTime.UtcNow;
    }
    public ReconocimientosController(ApplicationDbContext context, IMapper mapper)
        : base(context, mapper) { }

    public override async Task<ActionResult<IEnumerable<ReconocimientoResponse>>> GetAll(
        [FromQuery] string? filters = null,
        [FromQuery] string? orderBy = null,
        [FromQuery] string? orderDirection = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
    )
    {
        var baseQuery = _context.Reconocimientos
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
        return Ok(_mapper.Map<List<ReconocimientoResponse>>(items));
    }

    public override async Task<ActionResult<ReconocimientoResponse>> GetById(object id)
    {
        var item = await _context.Reconocimientos
            .FirstOrDefaultAsync(r => r.ReconocimientoId == (int)id);

        if (item == null) return NotFound();
        return Ok(_mapper.Map<ReconocimientoResponse>(item));
    }

    // Metodo para procesar la aprobacion o rechazo de un reconocimiento
    [HttpPost("review/{reconocimientoId}")]
    public async Task<IActionResult> ReviewReconocimiento(int reconocimientoId, [FromBody] ReviewRequest reviewRequest)
    {
        var reconocimiento = await _context.Reconocimientos
            .FirstOrDefaultAsync(r => r.ReconocimientoId == reconocimientoId);

        if (reconocimiento == null)
        {
            return NotFound("Reconocimiento not found.");
        }

        // Actualizar el estado del reconocimiento
        reconocimiento.Estado = reviewRequest.Aprobar ? "Aprobado" : "Rechazado";
        reconocimiento.AprobadorId = reviewRequest.AprobadorId;
        reconocimiento.ComentarioAprobacion = reviewRequest.ComentarioAprobacion;
        reconocimiento.FechaResolucion = reviewRequest.FechaResolucion;

        _context.Reconocimientos.Update(reconocimiento);
        await _context.SaveChangesAsync();

        return Ok(_mapper.Map<ReconocimientoResponse>(reconocimiento));
    }
                                                                                            
}
