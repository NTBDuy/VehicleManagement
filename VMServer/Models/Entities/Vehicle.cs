using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YouMedServer.Models.Entities
{
    public enum Status { Available, InUse, UnderMaintenance }

    public class Vehicle
    {
        [Key]
        public int VehicleId { get; set; }

        [Required]
        [MaxLength(20)]
        public string LicensePlate { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Brand { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Model { get; set; } = null!;

        [Required]
        [EnumDataType(typeof(Status))]
        public Status Status { get; set; }

        public DateTime? LastMaintenance { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime LastUpdateAt { get; set; } = DateTime.Now;
    }
}