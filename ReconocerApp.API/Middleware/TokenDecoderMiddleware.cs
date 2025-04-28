namespace ReconocerApp.API.Middleware;

using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Http;
using ReconocerApp.API.Models;

public class TokenDecoderMiddleware
{
    private readonly RequestDelegate _next;

    public TokenDecoderMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var authorizationHeader = context.Request.Headers["Authorization"].ToString();
        if (!string.IsNullOrEmpty(authorizationHeader) && authorizationHeader.StartsWith("Bearer "))
        {
            var token = authorizationHeader["Bearer ".Length..];
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);

                var decodedUser = new DecodedUser
                {
                    Oid = jwtToken.Payload.TryGetValue("oid", out var oid) ? oid?.ToString() : null,
                    Name = jwtToken.Payload.TryGetValue("name", out var name) ? name?.ToString() : null,
                    Email = jwtToken.Payload.TryGetValue("email", out var email) ? email?.ToString() : null
                };

                // Almacena el usuario decodificado en el contexto
                context.Items["User"] = decodedUser;
            }
            catch
            {
                // Si el token es inválido, no se almacena nada
                context.Items["User"] = null;
            }
        }
        else
        {
            // Si no hay token, el usuario será nulo
            context.Items["User"] = null;
        }

        await _next(context);
    }
}