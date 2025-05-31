using VMServer.Models.Entities;

namespace VMServer.Models.DTOs
{
    public class MaintenanceScheduleDTO
    {
        public DateTime ScheduledDate { get; set; }

        public int EstimatedDurationInDays { get; set; }

        public string Description { get; set; } = null!;
    }
}