using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VMServer.Models.Entities
{
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
        [MaxLength(500)]
        public string Description { get; set; } = null!;

        public Vehicle? Vehicle { get; set; }
    }
}