using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VMServer.Models.Entities
{
    public enum MaintenanceStatus { Pending, InProgress, Done }

    public class MaintenanceSchedule
    {
        [Key]
        public int MaintenanceId { get; set; }

        [Required]
        [ForeignKey("Vehicle")]
        public int VehicleId { get; set; }

        [Required]
        public DateTime ScheduledDate { get; set; }

        [Required]
        public DateTime EstimatedEndDate { get; set; }

        [Required]
        public MaintenanceStatus Status { get; set; } = MaintenanceStatus.Pending;

        public DateTime CreateAt { get; set; } = DateTime.Now;

        public DateTime LastUpdateAt { get; set; } = DateTime.Now;

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = null!;

        public Vehicle? Vehicle { get; set; }
    }
}