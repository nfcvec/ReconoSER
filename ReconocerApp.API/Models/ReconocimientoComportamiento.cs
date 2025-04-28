using System.ComponentModel.DataAnnotations;

namespace ReconocerApp.API.Models;

public class ReconocimientoComportamiento
{
    [Key]
    public int Id { get; set; }
    public int ReconocimientoId { get; set; }
    public int ComportamientoId { get; set; }

    public virtual Reconocimiento? Reconocimiento { get; set; }
    public virtual Comportamiento? Comportamiento { get; set; }
}
