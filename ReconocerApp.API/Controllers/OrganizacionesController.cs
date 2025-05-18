using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReconocerApp.API.Controllers.Base;
using ReconocerApp.API.Data;
using ReconocerApp.API.Models;
using ReconocerApp.API.Models.Responses;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ReconocerApp.API.Controllers;

public class OrganizacionesController : BaseCrudController<Organizacion, OrganizacionResponse, int>
{
    public OrganizacionesController(ApplicationDbContext context, IMapper mapper)
        : base(context, mapper) { }

    [HttpGet("by-user")]
    public async Task<ActionResult<OrganizacionResponse>> GetByUser([FromQuery] string? oid = null)
    {
        var user = HttpContext.Items["User"] as DecodedUser;

        if (string.IsNullOrEmpty(oid) && user == null)
        {
            Console.WriteLine("[GetByUser] Usuario no autenticado: no se recibió oid ni hay usuario en contexto.");
            return Unauthorized("Usuario no autenticado.");
        }

        string? oidToUse;
        string? emailToUse = null;
        if (!string.IsNullOrEmpty(oid))
        {
            oidToUse = oid;
            Console.WriteLine($"[GetByUser] OID tomado del parámetro: {oidToUse}");
            // Buscar en la tabla de Colaboradores si existe una relación
            var colaborador = await _context.Colaboradores.FirstOrDefaultAsync(c => c.ColaboradorId == oidToUse);
            if (colaborador != null)
            {
                var organizacion = await _context.Organizaciones.FirstOrDefaultAsync(o => o.OrganizacionId == colaborador.OrganizacionId);
                if (organizacion != null)
                {
                    var excepcion = _mapper.Map<OrganizacionResponse>(organizacion);
                    Console.WriteLine($"[GetByUser] Organización encontrada para colaborador OID: {oidToUse}");
                    Console.WriteLine($"[GetByUser] Organización (JSON): {System.Text.Json.JsonSerializer.Serialize(excepcion)}");
                    return Ok(excepcion);
                }
            }
            // Si no está en colaboradores, buscar en Azure AD con GraphService
            var graphService = HttpContext.RequestServices.GetService(typeof(ReconocerApp.API.Services.Graph.IGraphService)) as ReconocerApp.API.Services.Graph.IGraphService;
            if (graphService != null)
            {
                try
                {
                    var userInfo = await graphService.GetUserInfoAsync(oidToUse);
                    emailToUse = userInfo?.Email;
                    Console.WriteLine($"[GetByUser] Email obtenido de GraphService: {emailToUse}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[GetByUser] Error al consultar GraphService: {ex.Message}");
                }
            }
        }
        else
        {
            oidToUse = user?.Oid;
            Console.WriteLine($"[GetByUser] OID tomado del token: {oidToUse}");
            emailToUse = user?.Email;
        }

        if (string.IsNullOrEmpty(emailToUse))
        {
            Console.WriteLine("[GetByUser] No se pudo determinar el email del usuario.");
            return BadRequest("No se pudo determinar el email del usuario.");
        }

        // Separate the email into username and domain
        var emailParts = emailToUse.Split('@');
        if (emailParts.Length != 2)
        {
            Console.WriteLine($"[GetByUser] Email malformado: {emailToUse}");
            return BadRequest("El correo electrónico del usuario no es válido.");
        }
        var domain = emailParts[1].Trim().ToLower();
        Console.WriteLine($"[GetByUser] Dominio extraído del email: '{domain}'");
        var organizaciones = await _context.Organizaciones
            .Where(o => o.DominioEmail.Trim().ToLower() == domain)
            .ToListAsync();
        if (organizaciones == null || !organizaciones.Any())
        {
            Console.WriteLine($"[GetByUser] No se encontraron organizaciones para el dominio: {domain}");
            // Devolver un OrganizacionResponse con valores por defecto (string.Empty para strings)
            var emptyResponse = new OrganizacionResponse
            {
                OrganizacionId = 0,
                Nombre = string.Empty,
                Descripcion = string.Empty,
                DominioEmail = string.Empty,
                ColorPrincipal = string.Empty,
                Activa = false
            };
            return Ok(emptyResponse);
        }
        var response = _mapper.Map<OrganizacionResponse>(organizaciones.First());
        Console.WriteLine($"[GetByUser] Organización encontrada por dominio de email: {domain}");
        Console.WriteLine($"[GetByUser] Organización (JSON): {System.Text.Json.JsonSerializer.Serialize(response)}");
        return Ok(response);
    }
}
