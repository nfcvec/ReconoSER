using System.Linq.Dynamic.Core;
using System.Linq.Dynamic.Core.Parser;
using ReconocerApp.API.Models.Filters;

namespace ReconocerApp.API.Services.Filtering;

public static class DynamicFilterService
{
    public static IQueryable<T> ApplyFilters<T>(IQueryable<T> query, List<FilterRequest> filters)
    {
        var config = new ParsingConfig
        {
            ResolveTypesBySimpleName = true,
            AllowNewToEvaluateAnyType = true
        };

        foreach (var filter in filters)
        {
            if (string.IsNullOrWhiteSpace(filter.Field)) continue;

            // Normaliza: mayúscula por propiedad
            var fieldParts = filter.Field
                .Split('.')
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Select(p => char.ToUpper(p[0]) + p.Substring(1));

            var normalizedField = string.Join('.', fieldParts);

            string expression = filter.Operator.ToLower() switch
            {
                "contains" => $"{normalizedField}.Contains(@0)",
                "eq" => $"{normalizedField} == @0",
                "neq" => $"{normalizedField} != @0",
                "gt" => $"{normalizedField} > @0",
                "lt" => $"{normalizedField} < @0",
                _ => throw new NotSupportedException($"Operator '{filter.Operator}' is not supported.")
            };

            Console.WriteLine($"Expresión generada: {expression} | Valor: {filter.Value}");

            query = query.Where(config, expression, filter.Value);
        }

        return query;
    }
}
