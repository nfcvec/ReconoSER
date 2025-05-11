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

        var totalItems = await baseQuery.CountAsync();
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

    public class ReviewRequest
    {
        public bool Aprobar { get; set; }
        public string ComentarioAprobacion { get; set; } = string.Empty;
        public string AprobadorId { get; set; } = string.Empty;
        public bool GenerarULIs { get; set; } = false;
        public DateTime FechaResolucion { get; set; } = DateTime.UtcNow;
    }

    [HttpPost("review/{reconocimientoId}")]
    public async Task<IActionResult> ReviewReconocimiento(int reconocimientoId, [FromBody] ReviewRequest reviewRequest)
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

        reconocimiento.Estado = reviewRequest.Aprobar ? "Aprobado" : "Rechazado";
        reconocimiento.AprobadorId = reviewRequest.AprobadorId;
        reconocimiento.ComentarioAprobacion = reviewRequest.ComentarioAprobacion;
        reconocimiento.FechaResolucion = reviewRequest.FechaResolucion;

        _context.Reconocimientos.Update(reconocimiento);
        await _context.SaveChangesAsync();

        return Ok(_mapper.Map<ReconocimientoResponse>(reconocimiento));
    }
}
