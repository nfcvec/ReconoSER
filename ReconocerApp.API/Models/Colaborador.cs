using System.ComponentModel.DataAnnotations;

namespace ReconocerApp.API.Models;

public class Colaborador
{
    [Key]
    public string ColaboradorId { get; set; } = string.Empty;
    public int OrganizacionId { get; set; }
    public bool ExcepcionConfiguracion { get; set; }

    public virtual Organizacion? Organizacion { get; set; }
}
