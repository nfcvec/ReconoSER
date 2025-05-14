using System.Linq.Dynamic.Core;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ReconocerApp.API.Models.Filters;

namespace ReconocerApp.API.Services.Filtering;

public class DynamicFilterService : IDynamicFilterService
{
    private readonly ILogger<DynamicFilterService> _logger;

    public DynamicFilterService(ILogger<DynamicFilterService> logger)
    {
        _logger = logger;
    }

    public IQueryable<T> ApplyFilters<T>(IQueryable<T> query, string filterJson)
    {
        if (string.IsNullOrEmpty(filterJson))
        {
            return query;
        }

        try
        {
            var filterRequests = JsonSerializer.Deserialize<List<FilterRequest>>(filterJson);
            if (filterRequests == null || !filterRequests.Any())
            {
                return query;
            }

            return ApplyFilters(query, filterRequests);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Error al deserializar filtros: {Message}", ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al aplicar filtros: {Message}", ex.Message);
        }

        return query;
    }

    public IQueryable<T> ApplyFilters<T>(IQueryable<T> query, List<FilterRequest> filters)
    {
        if (filters == null || !filters.Any())
        {
            return query;
        }

        try
        {
            foreach (var filter in filters)
            {
                // Use strongly-typed expressions for known properties
                if (typeof(T).GetProperty(filter.Field) != null)
                {
                    switch (filter.Operator.ToLower())
                    {
                        case "eq":
                            query = query.Where($"{filter.Field} == @0", filter.Value);
                            break;
                        case "contains":
                            query = query.Where($"{filter.Field}.Contains(@0)", filter.Value);
                            break;
                        case "startswith":
                            query = query.Where($"{filter.Field}.StartsWith(@0)", filter.Value);
                            break;
                        case "endswith":
                            query = query.Where($"{filter.Field}.EndsWith(@0)", filter.Value);
                            break;
                        case "gt":
                            query = query.Where($"{filter.Field} > @0", filter.Value);
                            break;
                        case "lt":
                            query = query.Where($"{filter.Field} < @0", filter.Value);
                            break;
                        case "gte":
                            query = query.Where($"{filter.Field} >= @0", filter.Value);
                            break;
                        case "lte":
                            query = query.Where($"{filter.Field} <= @0", filter.Value);
                            break;
                        default:
                            _logger.LogWarning($"Unsupported filter operator: {filter.Operator}");
                            break;
                    }
                }
                else
                {
                    _logger.LogWarning($"Property '{filter.Field}' does not exist on type '{typeof(T).Name}'");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying filters: {Message}", ex.Message);
        }

        return query;
    }

    public IQueryable<T> ApplySorting<T>(IQueryable<T> query, string orderBy, string orderDirection)
    {
        if (string.IsNullOrEmpty(orderBy))
        {
            return query;
        }

        try
        {
            var direction = !string.IsNullOrEmpty(orderDirection) && 
                orderDirection.Equals("desc", StringComparison.OrdinalIgnoreCase) 
                ? "descending" 
                : "ascending";
            
            return query.OrderBy($"{orderBy} {direction}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al aplicar ordenamiento: {Message}", ex.Message);
            return query;
        }
    }
}
