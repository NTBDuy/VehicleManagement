using VMServer.Models.Entities;

namespace VMServer.Models.DTOs
{
    public class VehicleMostUsage
    {
        public required Vehicle Vehicle { get; set; }

        public required int Count { get; set; }
    }
}