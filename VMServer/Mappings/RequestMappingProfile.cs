using AutoMapper;
using VMServer.Models.Entities;
using VMServer.Models.DTOs;

namespace VMServer.Mappings
{
    public class RequestMappingProfile : Profile
    {
        public RequestMappingProfile()
        {
            // Request mappings
            CreateMap<Request, RequestListDto>()
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
                .ForMember(dest => dest.Vehicle, opt => opt.MapFrom(src => src.Vehicle));

            CreateMap<Request, RequestDetailDto>()
                .ForMember(dest => dest.ActionByUser, opt => opt.MapFrom(src => src.ActionByUser))
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
                .ForMember(dest => dest.Vehicle, opt => opt.MapFrom(src => src.Vehicle))
                .ForMember(dest => dest.Locations, opt => opt.MapFrom(src => src.Locations));

            // User mappings
            CreateMap<User, UserBasicDto>();
            CreateMap<User, UserDetailDto>();

            // Vehicle mappings
            CreateMap<Vehicle, VehicleBasicDto>();
            CreateMap<Vehicle, VehicleDetailDto>();

            // Location mapping
            CreateMap<RequestLocation, LocationDto>();

            // Assignment mapping
            CreateMap<Assignment, AssignmentDto>()
                .ForMember(dest => dest.Driver, opt => opt.MapFrom(src => src.Driver));

            // Driver mapping
            CreateMap<Driver, DriverDto>();
        }
    }
}