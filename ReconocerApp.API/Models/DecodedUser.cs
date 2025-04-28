namespace ReconocerApp.API.Models;

public class DecodedUser
{
    public string? Oid { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    // Agrega más propiedades según lo que necesites del token
}