using System.ComponentModel.DataAnnotations;

namespace ReconocerApp.API.Models;

public class WalletSaldo
{
    [Key]
    public int WalletSaldoId { get; set; }
    public string TokenColaborador { get; set; }
    public int SaldoActual { get; set; }
    

    public virtual ICollection<WalletTransaccion>? Transacciones { get; set; }
}
