using VMServer.Models.Entities;

namespace VMServer.Models.DTOs
{
    public class RescheduleMaintenanceDTO
    {
        public required DateTime StartDate { get; set; }
        public required DateTime EndDate { get; set; }
    }
}