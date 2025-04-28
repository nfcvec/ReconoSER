using System.ComponentModel.DataAnnotations;

namespace ReconocerApp.API.Models;

public class Comportamiento
{
    [Key]
    public int ComportamientoId { get; set; }
    public int OrganizacionId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public int WalletOtorgados { get; set; }

    public virtual Organizacion? Organizacion { get; set; }
    public virtual ICollection<ReconocimientoComportamiento>? ReconocimientoComportamientos { get; set; }
}
