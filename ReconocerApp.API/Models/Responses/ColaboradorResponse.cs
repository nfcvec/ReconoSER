namespace ReconocerApp.API.Models.Responses;

public class ColaboradorResponse
{
    public string ColaboradorId { get; set; } = string.Empty;
    public int OrganizacionId { get; set; }
    public bool ExcepcionConfiguracion { get; set; }
    public OrganizacionResponse? Organizacion { get; set; }
}
