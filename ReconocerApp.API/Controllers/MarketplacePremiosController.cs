using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using System.Text.Json;
using System.Linq.Dynamic.Core;
using System.Linq.Dynamic.Core.Parser;
using ReconocerApp.API.Controllers.Base;
using ReconocerApp.API.Data;
using ReconocerApp.API.Models;
using ReconocerApp.API.Models.Responses;
using ReconocerApp.API.Models.Filters;
using ReconocerApp.API.Services.Filtering;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;
using ReconocerApp.API.Services;
using System.Net.Http.Headers;
using System.Net.Http;

namespace ReconocerApp.API.Controllers;

public class MarketplacePremiosController : BaseCrudController<MarketplacePremio, MarketplacePremioResponse, int>
{
    private readonly MinioService _minioService;

    public MarketplacePremiosController(ApplicationDbContext context, IMapper mapper, MinioService minioService, IDynamicFilterService filterService)
        : base(context, mapper, filterService)
    {
        _minioService = minioService;
    }

    public override async Task<ActionResult<IEnumerable<MarketplacePremioResponse>>> GetAll(
        [FromQuery] string? filters = null,
        [FromQuery] string? orderBy = null,
        [FromQuery] string? orderDirection = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
    )
    {
        var baseQuery = _context.MarketplacePremios
            .Include(p => p.Organizacion)
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

            foreach (var filter in parsedFilters)
            {
                Console.WriteLine($"Field: {filter.Field}, Operator: {filter.Operator}, Value: {filter.Value}");
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
            .ProjectTo<MarketplacePremioResponse>(_mapper.ConfigurationProvider)
            .ToListAsync();

        Response.Headers["X-Total-Count"] = totalItems.ToString();
        return Ok(items);
    }

    [HttpGet("detalle/{id:int}")]
    public async Task<ActionResult<MarketplacePremioResponse>> Detalle(int id)
    {
        var entity = await _context.MarketplacePremios
            .Include(p => p.Organizacion)
            .Include(p => p.Categoria) // si estás usando categoría
            .FirstOrDefaultAsync(p => p.PremioId == id);

        if (entity == null)
            return NotFound();

        var dto = _mapper.Map<MarketplacePremioResponse>(entity);
        return Ok(dto);
    }

    [HttpPost("{premioId}/upload-images")]
    public async Task<IActionResult> UploadImages(int premioId, [FromForm] List<IFormFile> files)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest("No files uploaded.");
        }

        var premio = await _context.MarketplacePremios.FindAsync(premioId);
        if (premio == null)
        {
            return NotFound("Premio not found.");
        }

        foreach (var file in files)
        {
            var objectName = $"premios/{premioId}/{Guid.NewGuid()}_{file.FileName}";
            using var stream = file.OpenReadStream();
            await _minioService.UploadImageAsync(objectName, stream, file.ContentType);
        }

        return Ok("Images uploaded successfully.");
    }

    [HttpGet("{premioId}/images")]
    public async Task<IActionResult> GetImages(int premioId)
    {
        var premio = await _context.MarketplacePremios.FindAsync(premioId);
        if (premio == null)
        {
            return NotFound("Premio not found.");
        }

        var images = await _minioService.GetImagesAsync($"premios/{premioId}/");
        return Ok(images);
    }

    [HttpDelete("{premioId}/images/{imageName}")]
    public async Task<IActionResult> DeleteImage(int premioId, string imageName)
    {
        var premio = await _context.MarketplacePremios.FindAsync(premioId);
        if (premio == null)
        {
            return NotFound("Premio not found.");
        }

        await _minioService.DeleteImageAsync($"premios/{premioId}/{imageName}");
        return Ok("Image deleted successfully.");
    }
}
