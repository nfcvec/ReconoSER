using System.ComponentModel.DataAnnotations;

namespace ReconocerApp.API.Models;

public class Reconocimiento
{
    [Key]
    public int ReconocimientoId { get; set; }
    public string TokenColaborador { get; set; } = string.Empty;
    public string Justificacion { get; set; } = string.Empty;
    public string Texto { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string FechaCreacion { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public string ComentarioRevision { get; set; } = string.Empty;
    public string FechaResolucion { get; set; } = string.Empty;
    
    public virtual ICollection<ReconocimientoComportamiento>? ReconocimientoComportamientos { get; set; }
}
