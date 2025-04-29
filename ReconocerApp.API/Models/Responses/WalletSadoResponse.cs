namespace ReconocerApp.API.Models.Responses;

public class WalletSaldoResponse
{
    public int WalletSaldoId { get; set; }
    public string TokenColaborador { get; set; } = string.Empty;
    public int SaldoActual { get; set; }
}

