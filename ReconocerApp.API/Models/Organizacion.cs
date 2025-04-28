using System.ComponentModel.DataAnnotations;

namespace ReconocerApp.API.Models;

public class Organizacion
{
    [Key]
    public int OrganizacionId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string DominioEmail { get; set; } = string.Empty;
    public bool Activa { get; set; }

    public virtual ICollection<Colaborador>? Colaboradores { get; set; }
    public virtual ICollection<MarketplacePremio>? Premios { get; set; }
    public virtual ICollection<Comportamiento>? Comportamientos { get; set; }
}
