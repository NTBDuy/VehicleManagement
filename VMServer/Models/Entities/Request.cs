using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YouMedServer.Models.Entities
{
    public enum RequestStatus { Pending, Approved, Rejected, Cancelled }

    public class Request
    {
        [Key]
        public int RequestId { get; set; }

        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; }

        [Required]
        [ForeignKey("Vehicle")]
        public int VehicleId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Required]
        [MaxLength(255)]
        public string Purpose { get; set; } = null!;

        [Required]
        public RequestStatus Status { get; set; }

        public bool IsDriverRequired { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public User? User { get; set; }
        public Vehicle? Vehicle { get; set; }
    }
}