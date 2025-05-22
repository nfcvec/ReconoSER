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
using ReconocerApp.API.Services.Notifications;
using ReconocerApp.API.Services.Graph;

namespace ReconocerApp.API.Controllers
{
    public class WalletSaldosController : BaseCrudController<WalletSaldo, WalletSaldoResponse, int>
    {
        private readonly IEmailNotificationService _emailService;
        private readonly IEmailTemplateProvider _templateProvider;
        private readonly IGraphService _graphService;
        private readonly IConfiguration _configuration;

        public WalletSaldosController(ApplicationDbContext context, IMapper mapper, IDynamicFilterService filterService, IEmailNotificationService emailService, IEmailTemplateProvider templateProvider, IGraphService graphService, IConfiguration configuration)
            : base(context, mapper, filterService)
        {
            _emailService = emailService;
            _templateProvider = templateProvider;
            _graphService = graphService;
            _configuration = configuration;
        }

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

        public class RecargaBonoRequest
        {
            public string ColaboradorId { get; set; } = string.Empty;
            public int Monto { get; set; }
        }

        [HttpPost("recargar-bono")]
        public async Task<ActionResult<WalletSaldoResponse>> RecargarBono([FromBody] RecargaBonoRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.ColaboradorId) || request.Monto <= 0)
            {
                return BadRequest("Datos inválidos para recarga de bono.");
            }

            // Buscar o crear la categoría "Bono"
            var categoria = await _context.WalletCategorias.FirstOrDefaultAsync(c => c.Nombre.ToLower().Contains("bono"));
            if (categoria == null)
            {
                categoria = new WalletCategoria { Nombre = "Bono", Descripcion = "Recarga por bono" };
                _context.WalletCategorias.Add(categoria);
                await _context.SaveChangesAsync();
            }

            // Buscar o crear el saldo
            var walletSaldo = await _context.WalletSaldos.FirstOrDefaultAsync(ws => ws.TokenColaborador == request.ColaboradorId);
            if (walletSaldo == null)
            {
                walletSaldo = new WalletSaldo { TokenColaborador = request.ColaboradorId, SaldoActual = 0 };
                _context.WalletSaldos.Add(walletSaldo);
                await _context.SaveChangesAsync();
            }

            // Crear la transacción
            var transaccion = new WalletTransaccion
            {
                WalletSaldoId = walletSaldo.WalletSaldoId,
                TokenColaborador = request.ColaboradorId,
                CategoriaId = categoria.CategoriaId,
                Cantidad = request.Monto,
                Descripcion = $"Recarga de bono por {request.Monto}",
                Fecha = DateTime.UtcNow, // Ahora es DateTime
            };
            _context.WalletTransacciones.Add(transaccion);
            await _context.SaveChangesAsync();

            // Sumar todas las transacciones para actualizar el saldo
            var totalSaldo = await _context.WalletTransacciones
                .Where(wt => wt.TokenColaborador == request.ColaboradorId)
                .SumAsync(wt => wt.Cantidad);
            walletSaldo.SaldoActual = totalSaldo;
            _context.WalletSaldos.Update(walletSaldo);
            await _context.SaveChangesAsync();

            // --- Notificación por correo al colaborador ---
            try
            {
                var userInfo = await _graphService.GetUserInfoAsync(request.ColaboradorId);
                var toEmail = userInfo?.Email;
                var colaboradorNombre = userInfo?.DisplayName ?? request.ColaboradorId;
                var fromAddress = _configuration["Email:FromAddress"] ?? "no-reply@reconoser.com";
                if (!string.IsNullOrEmpty(toEmail))
                {
                    var templateModel = new
                    {
                        ColaboradorNombre = colaboradorNombre,
                        Monto = request.Monto,
                        Fecha = DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm")
                    };
                    var emailContent = await _templateProvider.GetProcessedTemplateAsync("WalletBonoOtorgado", templateModel);
                    await _emailService.SendEmailAsync(fromAddress, toEmail, "¡Has recibido un bono en tu billetera!", emailContent);
                }
            }
            catch
            {
                // Loguear pero no interrumpir la recarga
            }
            // --- Fin notificación ---

            var response = _mapper.Map<WalletSaldoResponse>(walletSaldo);
            return Ok(response);
        }
    }
}
