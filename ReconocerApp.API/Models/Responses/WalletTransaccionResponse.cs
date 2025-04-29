namespace ReconocerApp.API.Models.Responses;

public class WalletTransaccionResponse
{
    public int TransaccionId { get; set; }
    public string TokenColaborador { get; set; } = string.Empty;
    public int CategoriaId { get; set; }
    public int Cantidad { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public string Fecha { get; set; } = string.Empty;
}
