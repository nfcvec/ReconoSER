using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.SqlServer;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using ReconocerApp.API.Data;
using ReconocerApp.API.Mappings; // 👈 Asegúrate de tener este using
using ReconocerApp.API.Middleware;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using ReconocerApp.API.Extensions;
using ReconocerApp.API.Services.Notifications;
using ReconocerApp.API.Services.Graph;
using ReconocerApp.API.Services.Filtering;
using ReconocerApp.API.Services.Reconocimientos;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
// Habilitar logs de consola
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Add services
builder.Services.AddControllers();

// Register MinioService
builder.Services.AddScoped<MinioService>();

// Register AutoMapper
builder.Services.AddAutoMapper(typeof(ReconocerApp.API.Mapping.MappingProfile));

// Add NotificationServices
builder.Services.AddNotificationServices(builder.Configuration);

// Register services
builder.Services.AddScoped<IEmailNotificationService, EmailNotificationService>();
builder.Services.AddScoped<IEmailTemplateProvider, EmailTemplateProvider>(provider =>
    new EmailTemplateProvider(
        provider.GetRequiredService<IWebHostEnvironment>(),
        provider.GetRequiredService<ILogger<EmailTemplateProvider>>(),
        provider.GetRequiredService<IConfiguration>()
    )
);
builder.Services.AddScoped<IReconocimientoService, ReconocimientoService>();
builder.Services.AddScoped<IWalletService, WalletService>();


// Register GraphService
builder.Services.AddHttpClient();
builder.Services.AddScoped<IGraphService, GraphService>();

// Register DynamicFilterService
builder.Services.AddScoped<IDynamicFilterService, DynamicFilterService>();

// Register custom services
builder.Services.AddCustomServices();

// Configurar DbContext dinámicamente
var databaseProvider = builder.Configuration.GetValue<string>("DatabaseProvider");
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (databaseProvider == "Sqlite")
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite(connectionString));
}
else if (databaseProvider == "PostgreSQL")
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else if (databaseProvider == "SQL Server")
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connectionString));
}
else
{
    throw new Exception("Unsupported database provider specified in appsettings.json");
}

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Configuración básica
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Reconoser API", Version = "v1" });

    // Configuración OpenID Connect (Microsoft)
    var azureAdSection = builder.Configuration.GetSection("AzureAd");
    var clientId = azureAdSection["ClientId"];
    var tenantId = azureAdSection["TenantId"];
    var authority = $"https://login.microsoftonline.com/{tenantId}/v2.0";

    options.AddSecurityDefinition("openid", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.OpenIdConnect,
        OpenIdConnectUrl = new Uri($"{authority}/.well-known/openid-configuration"),
        Description = "Autenticación OpenID Connect con Azure AD",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        [
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "openid"
                }
            }
        ] = new List<string>()
    });
});

var app = builder.Build();

app.UseCors("AllowAll");
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();

// Agrega el middleware para decodificar el token
app.UseMiddleware<TokenDecoderMiddleware>();

app.MapControllers();
app.MapGet("/", () => "Welcome to the API!");

app.MapPost("/validate", [AllowAnonymous] (HttpRequest request) =>
{
    var authorizationHeader = request.Headers["Authorization"].ToString();
    if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
    {
        return Results.BadRequest("Missing or invalid Authorization header.");
    }

    var token = authorizationHeader["Bearer ".Length..];
    try
    {
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        if (jwtToken.Payload.TryGetValue("oid", out var oid))
        {
            return Results.Ok(new { oid });
        }
        return Results.BadRequest("OID not found in token.");
    }
    catch (Exception ex)
    {
        return Results.BadRequest($"Invalid token: {ex.Message}");
    }
});

app.Run();
