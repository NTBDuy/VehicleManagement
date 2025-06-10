using VMServer.Models.Entities;

namespace VMServer.Models.DTOs
{
    public class VehicleDTO
    {
        public string LicensePlate { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string Brand { get; set; } = null!;
        public string Model { get; set; } = null!;
        public required decimal CurrentOdometer { get; set; }
    }
}