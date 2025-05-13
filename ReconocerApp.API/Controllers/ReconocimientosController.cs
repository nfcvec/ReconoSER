using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using ReconocerApp.API.Models;
using ReconocerApp.API.Models.Responses;
using ReconocerApp.API.Services.Reconocimientos;

namespace ReconocerApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReconocimientosController : ControllerBase
{
    private readonly IMapper _mapper;
    private readonly IReconocimientoService _reconocimientoService;
    private readonly ILogger<ReconocimientosController> _logger;

    public ReconocimientosController(
        IMapper mapper,
        IReconocimientoService reconocimientoService,
        ILogger<ReconocimientosController> logger)
    {
        _mapper = mapper;
        _reconocimientoService = reconocimientoService;
        _logger = logger;
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
        try
        {
            var (items, totalCount) = await _reconocimientoService.GetReconocimientosAsync(filters, orderBy, orderDirection, page, pageSize);
            
            Response.Headers["X-Total-Count"] = totalCount.ToString();
            return Ok(_mapper.Map<List<ReconocimientoResponse>>(items));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener reconocimientos");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReconocimientoResponse>> GetById(int id)
    {
        var item = await _reconocimientoService.GetReconocimientoByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(_mapper.Map<ReconocimientoResponse>(item));
    }

    [HttpPost]
    public async Task<ActionResult<ReconocimientoResponse>> Create([FromBody] Reconocimiento reconocimiento)
    {
        try
        {
            var result = await _reconocimientoService.CreateReconocimientoAsync(reconocimiento);
            return Ok(_mapper.Map<ReconocimientoResponse>(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear reconocimiento");
            return StatusCode(500, $"Error creando reconocimiento: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Reconocimiento reconocimiento)
    {
        try
        {
            if (id != reconocimiento.ReconocimientoId)
            {
                return BadRequest("ID mismatch.");
            }

            var result = await _reconocimientoService.UpdateReconocimientoAsync(id, reconocimiento);
            return Ok(_mapper.Map<ReconocimientoResponse>(result));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar reconocimiento");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _reconocimientoService.DeleteReconocimientoAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar reconocimiento");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    public class ReconocimientoReviewRequest
    {
        public bool Aprobar { get; set; }
        public string ComentarioAprobacion { get; set; } = string.Empty;
        public string AprobadorId { get; set; } = string.Empty;
        public bool GenerarULIs { get; set; } = false;
        public DateTime FechaResolucion { get; set; } = DateTime.UtcNow;
    }

    [HttpPost("review/{reconocimientoId}")]
    public async Task<IActionResult> ReviewReconocimiento(int reconocimientoId, [FromBody] ReconocimientoReviewRequest reviewRequest)
    {
        try
        {
            var resultado = await _reconocimientoService.ReviewReconocimientoAsync(reconocimientoId, reviewRequest);
            return Ok(_mapper.Map<ReconocimientoResponse>(resultado));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al procesar solicitud de revisión de reconocimiento");
            return StatusCode(500, "Error interno del servidor");
        }
    }
}
