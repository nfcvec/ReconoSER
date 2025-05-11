namespace ReconocerApp.API.Models.Responses;

public class ReconocimientoResponse
{
    public int ReconocimientoId { get; set; }
    public string ReconocedorId { get; set; } = string.Empty;
    public string ReconocidoId { get; set; } = string.Empty;
    public string Justificacion { get; set; } = string.Empty;
    public string Texto { get; set; } = string.Empty;
    public string FechaCreacion { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public string AprobadorId { get; set; } = string.Empty;
    public string ComentarioAprobacion { get; set; } = string.Empty;
    public string FechaResolucion { get; set; } = string.Empty;
}
