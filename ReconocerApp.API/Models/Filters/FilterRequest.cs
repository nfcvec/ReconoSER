namespace ReconocerApp.API.Models.Filters;

using System.Text.Json.Serialization;

public class FilterRequest
{
    [JsonPropertyName("field")]
    public required string Field { get; set; } // Added required modifier

    [JsonPropertyName("operator")]
    public required string Operator { get; set; } // Added required modifier

    [JsonPropertyName("value")]
    public required string Value { get; set; } // Added required modifier
}
