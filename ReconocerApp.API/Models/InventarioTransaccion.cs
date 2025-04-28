using System.ComponentModel.DataAnnotations;

namespace ReconocerApp.API.Models;

public class InventarioTransaccion
{
    [Key]
    public int TransaccionId { get; set; }
    public int PremioId { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public string Fecha { get; set; } = string.Empty;

    public virtual MarketplacePremio? Premio { get; set; }
}