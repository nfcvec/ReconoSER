namespace ReconocerApp.API.Models.Responses;

public class ComportamientoResponse
{
    public int ComportamientoId { get; set; }
    public int OrganizacionId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public int WalletOtorgados { get; set; }
    public string? IconSvg { get; set; } // Nuevo campo para el SVG del ícono
    public OrganizacionResponse? Organizacion { get; set; }
}
