using VMServer.Models.Entities;

namespace VMServer.Models.DTOs
{
    public class RequestListDto
    {
        public int RequestId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public Status? Status { get; set; }
        public bool IsDriverRequired { get; set; }
        public UserBasicDto? User { get; set; }
        public VehicleBasicDto? Vehicle { get; set; }
    }

    public class RequestDetailDto
    {
        public int RequestId { get; set; }
        public Status? Status { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? Purpose { get; set; }
        public bool IsDriverRequired { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastUpdateAt { get; set; }
        public UserBasicDto? ActionByUser { get; set; }
        public string? CancelOrRejectReason { get; set; }
        public double TotalDistance { get; set; }
        public List<LocationDto>? Locations { get; set; }
        public UserDetailDto? User { get; set; }
        public int UserId { get; set; }
        public VehicleDetailDto? Vehicle { get; set; }
    }

    public class UserBasicDto
    {
        public string? FullName { get; set; }
    }

    public class UserDetailDto
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
    }

    public class VehicleBasicDto
    {
        public string? LicensePlate { get; set; }
    }

    public class VehicleDetailDto
    {
        public string? LicensePlate { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
    }

    public class LocationDto
    {
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? Note { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public int Order { get; set; }
    }

    public class AssignmentDto
    {
        public int AssignmentId { get; set; }
        public DriverDto? Driver { get; set; }
    }

    public class DriverDto
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
    }
}