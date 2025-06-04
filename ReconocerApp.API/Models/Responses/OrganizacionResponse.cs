namespace ReconocerApp.API.Models.Responses;

public class OrganizacionResponse
{
    public int OrganizacionId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string DominioEmail { get; set; } = string.Empty;
    public string ColorPrincipal { get; set; } = string.Empty;
    public bool Activa { get; set; }
    public string? IconSvg { get; set; }
}
