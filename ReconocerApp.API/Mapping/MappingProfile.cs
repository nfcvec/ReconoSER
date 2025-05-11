using AutoMapper;
using ReconocerApp.API.Models;
using ReconocerApp.API.Models.Responses;

namespace ReconocerApp.API.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Reconocimiento, ReconocimientoResponse>()
                .ForMember(dest => dest.Comportamientos, opt => opt.MapFrom(src => 
                    src.ReconocimientoComportamientos == null 
                        ? new List<Comportamiento>() 
                        : src.ReconocimientoComportamientos.Select(rc => rc.Comportamiento).Where(c => c != null)));
            
            CreateMap<Comportamiento, ComportamientoResponse>();
        }
    }
}
