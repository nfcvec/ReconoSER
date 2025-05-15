using System.ComponentModel.DataAnnotations;

namespace ReconocerApp.API.Models;

public class MarketplacePremio
{
    [Key]
    public int PremioId { get; set; }
    public int OrganizacionId { get; set; }
    public int CategoriaId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public int CostoWallet { get; set; }
    public string ImagenUrl { get; set; } = string.Empty;
    public string? ImagenPrincipal { get; set; } = string.Empty;
    public int CantidadActual { get; set; }
    public string UltimaActualizacion { get; set; } = string.Empty;

    public virtual Organizacion? Organizacion { get; set; }
    public virtual Categoria? Categoria { get; set; } 
    public virtual ICollection<MarketplaceCompra>? Compras { get; set; }
    public virtual ICollection<InventarioTransaccion>? InventarioTransacciones { get; set; }
}
