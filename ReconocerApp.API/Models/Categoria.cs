using System.ComponentModel.DataAnnotations;

namespace ReconocerApp.API.Models;

public class Categoria
{
    [Key]
    public int CategoriaId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;

    public virtual ICollection<MarketplacePremio>? Premios { get; set; }
}
