using AutoMapper;
using ReconocerApp.API.Models;
using ReconocerApp.API.Models.Responses;

namespace ReconocerApp.API.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Organizaciones
        CreateMap<Organizacion, OrganizacionResponse>();

        // Colaboradores
        CreateMap<Colaborador, ColaboradorResponse>()
            .ForMember(dest => dest.Organizacion, opt => opt.MapFrom(src => src.Organizacion));

        // Premios
       CreateMap<MarketplacePremio, MarketplacePremioResponse>()
            .ForMember(dest => dest.Organizacion, opt => opt.MapFrom(src => src.Organizacion));

        CreateMap<Comportamiento, ComportamientoResponse>()
            .ForMember(dest => dest.Organizacion, opt => opt.MapFrom(src => src.Organizacion));


        // Categorías
        CreateMap<WalletCategoria, WalletCategoriaResponse>();

        // Saldo
        CreateMap<WalletSaldo, WalletSaldoResponse>();

        // Transacciones Wallet
        CreateMap<WalletTransaccion, WalletTransaccionResponse>();

        // Comportamientos
        CreateMap<Comportamiento, ComportamientoResponse>();

        // Compras
        CreateMap<MarketplaceCompra, MarketplaceCompraResponse>();

        // Inventario de Premios
        CreateMap<InventarioTransaccion, InventarioTransaccionResponse>();

        // Reconocimientos
        CreateMap<Reconocimiento, ReconocimientoResponse>();

        // Reconocimiento - Comportamientos
        CreateMap<ReconocimientoComportamiento, ReconocimientoComportamientoResponse>();

        CreateMap<Categoria, CategoriaResponse>();

        CreateMap<MarketplacePremio, MarketplacePremioResponse>()
            .ForMember(dest => dest.Organizacion, opt => opt.MapFrom(src => src.Organizacion))
            .ForMember(dest => dest.Categoria, opt => opt.MapFrom(src => src.Categoria));
    }
}
