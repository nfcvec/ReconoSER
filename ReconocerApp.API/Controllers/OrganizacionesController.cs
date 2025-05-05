using AutoMapper;
using Microsoft.AspNetCore.Mvc;
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
}
