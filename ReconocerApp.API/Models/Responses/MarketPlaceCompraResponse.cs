namespace ReconocerApp.API.Models.Responses;

public class MarketplaceCompraResponse
{
    public int CompraId { get; set; }
    public string? TokenColaborador { get; set; }
    public int? PremioId { get; set; }
    public DateTime? FechaCompra { get; set; }
    public string? Estado { get; set; }
    public string? ComentarioRevision { get; set; }
    public DateTime? FechaResolucion { get; set; }
    public MarketplacePremioResponse? Premio { get; set; }
}
