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
    public async Task<ActionResult<OrganizacionResponse>> GetByUser()
    {
        var user = HttpContext.Items["User"] as DecodedUser;

        if (user == null)
        {
            return Unauthorized("Usuario no autenticado.");
        }

        // Primero, buscar en la tabla de Colaboradores si existe una relación
        var colaborador = await _context.Colaboradores
            .FirstOrDefaultAsync(c => c.ColaboradorId == user.Oid);

        if (colaborador != null)
        {
            // Si existe, devolver la organización asociada
            var organizacion = await _context.Organizaciones
                .FirstOrDefaultAsync(o => o.OrganizacionId == colaborador.OrganizacionId);

            if (organizacion != null)
            {
                // Map the result to the response model
                var excepcion = _mapper.Map<OrganizacionResponse>(organizacion);
                return Ok(excepcion);
            }
        }

        var email = user.Email;
        if (string.IsNullOrEmpty(email))
        {
            return BadRequest("El usuario no tiene un correo electrónico asociado.");
        }

        // Separate the email into username and domain
        var emailParts = email.Split('@');
        var username = emailParts[0];
        var domain = emailParts[1];
        var organizaciones = await _context.Organizaciones
            .Where(o => o.DominioEmail == domain)
            .ToListAsync();
        if (organizaciones == null || !organizaciones.Any())
        {
            return NotFound("No se encontraron organizaciones para el usuario.");
        }
        // Map the result to the response model
        var response = _mapper.Map<OrganizacionResponse>(organizaciones.First());
        return Ok(response);
        }
}
