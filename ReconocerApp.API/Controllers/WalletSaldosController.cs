using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReconocerApp.API.Controllers.Base;
using ReconocerApp.API.Data;
using ReconocerApp.API.Models;
using ReconocerApp.API.Models.Filters;
using ReconocerApp.API.Models.Responses;
using ReconocerApp.API.Services.Filtering;
using System.Linq.Dynamic.Core;
using System.Text.Json;
using ReconocerApp.API.Middleware;

namespace ReconocerApp.API.Controllers
{
    public class WalletSaldosController : BaseCrudController<WalletSaldo, WalletSaldoResponse, int>
    {
        public WalletSaldosController(ApplicationDbContext context, IMapper mapper, IDynamicFilterService filterService)
            : base(context, mapper, filterService) 
        { }

        // GET con filtros, orden y paginación
        public override async Task<ActionResult<IEnumerable<WalletSaldoResponse>>> GetAll(
            [FromQuery] string? filters = null,
            [FromQuery] string? orderBy = null,
            [FromQuery] string? orderDirection = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10
        )
        {
            var baseQuery = _context.WalletSaldos.AsQueryable();

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
            return Ok(_mapper.Map<List<WalletSaldoResponse>>(items));
        }

        // GET por ID (entero)
        [HttpGet("by-id/{id}")]
        public async Task<ActionResult<WalletSaldoResponse>> GetById(int id)
        {
            var entity = await _context.WalletSaldos
                .FirstOrDefaultAsync(ws => ws.WalletSaldoId == id);

            if (entity == null)
            {
                return NotFound();
            }

            var response = _mapper.Map<WalletSaldoResponse>(entity);
            return Ok(response);
        }

        // GET por ColaboradorId (string sin FK)
        [HttpGet("by-colaborador-id/{colaboradorId}")]
        public async Task<ActionResult<WalletSaldoResponse>> GetByColaboradorId(string colaboradorId)
        {
            var entity = await _context.WalletSaldos
                .FirstOrDefaultAsync(ws => ws.TokenColaborador == colaboradorId);

            if (entity == null)
            {
                entity = new WalletSaldo
                {
                    // Si no existe, lo creamos
                    TokenColaborador = colaboradorId,
                    SaldoActual = 0
                };
                
                _context.WalletSaldos.Add(entity);
                await _context.SaveChangesAsync(); // Guardamos en base de datos
            }

            var response = _mapper.Map<WalletSaldoResponse>(entity);
            return Ok(response);
        }

        [HttpGet("user-wallet")]
        public async Task<ActionResult<IEnumerable<WalletSaldoResponse>>> GetUserWallet()
        {
            var user = HttpContext.Items["User"] as DecodedUser;

            if (user == null)
            {
                return Unauthorized("No token provided or token is invalid.");
            }

            //debug user, return as json
            var userJson = JsonSerializer.Serialize(user);

            return Ok(userJson);
        }

        [HttpGet("by-user")]
        public async Task<ActionResult<WalletSaldoResponse>> GetByUser()
        {
            var user = HttpContext.Items["User"] as DecodedUser;

            if (user == null)
            {
                return Unauthorized("Usuario no autenticado.");
            }

            var entity = await _context.WalletSaldos
                .FirstOrDefaultAsync(ws => ws.TokenColaborador == user.Oid);

            if (entity == null)
            {
                // Obtener todas las transacciones del usuario y sumar el total
                var total = await _context.WalletTransacciones
                    .Where(t => t.TokenColaborador == user.Oid)
                    .SumAsync(t => t.Cantidad);

                entity = new WalletSaldo
                {
                    TokenColaborador = user.Oid!,
                    SaldoActual = total
                };

                _context.WalletSaldos.Add(entity);
                await _context.SaveChangesAsync();
            }

            var response = _mapper.Map<WalletSaldoResponse>(entity);
            return Ok(response);
        }
    }
}
