using ReconocerApp.API.Models.Filters;

namespace ReconocerApp.API.Services.Filtering;

public interface IDynamicFilterService
{
    IQueryable<T> ApplyFilters<T>(IQueryable<T> query, string filterJson);
    IQueryable<T> ApplyFilters<T>(IQueryable<T> query, List<FilterRequest> filters);
    IQueryable<T> ApplySorting<T>(IQueryable<T> query, string orderBy, string orderDirection);
}