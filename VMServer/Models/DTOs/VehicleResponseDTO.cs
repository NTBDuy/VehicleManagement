using VMServer.Models.Entities;

namespace VMServer.Models.DTOs
{
    public class VehicleResponseDTO
    {
        public int VehicleId { get; set; }
        public required string LicensePlate { get; set; }
        public required string Type { get; set; }
        public required string Brand { get; set; }
        public required string Model { get; set; }
        public Status Status { get; set; }
        public int? NextMaintenanceId { get; set; }
    }
}