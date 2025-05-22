using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReconocerApp.API.Models;

public class WalletTransaccion
{
    [Key]
    public int TransaccionId { get; set; }
    public int WalletSaldoId { get; set; }
    public string TokenColaborador { get; set; } = string.Empty;
    public int CategoriaId { get; set; } = 0;
    public int Cantidad { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } // Cambiado de string a DateTime

    [ForeignKey("WalletSaldoId")]
    public virtual WalletSaldo WalletSaldo { get; set; } = default!;

    public virtual WalletCategoria? Categoria { get; set; }
}
