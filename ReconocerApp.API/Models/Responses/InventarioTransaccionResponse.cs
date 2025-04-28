namespace ReconocerApp.API.Models.Responses;

public class InventarioTransaccionResponse
{
    public int TransaccionId { get; set; }
    public int PremioId { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public string Fecha { get; set; } = string.Empty;
}
