using System.ComponentModel.DataAnnotations;

namespace ReconocerApp.API.Models;

public class MarketplaceCompra
{
    [Key]
    public int CompraId { get; set; }
    public string TokenColaborador { get; set; } = string.Empty;
    public int PremioId { get; set; }
    public DateTime? FechaCompra { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? ComentarioRevision { get; set; } = string.Empty;
    public string? AprobadorId { get; set; } = string.Empty;
    public DateTime? FechaResolucion { get; set; }
    public virtual MarketplacePremio? Premio { get; set; }
}
