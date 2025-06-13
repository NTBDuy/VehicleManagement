using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VMServer.Models.Entities
{
    public enum RequestStatus { Pending, Approved, Rejected, Cancelled, InProgress, Done }

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
        public RequestStatus Status { get; set; } = RequestStatus.Pending;

        public bool IsDriverRequired { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime LastUpdateAt { get; set; } = DateTime.Now;

        [ForeignKey("ActionByUser")]
        public int? ActionBy { get; set; }

        public string? CancelOrRejectReason { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public double? TotalDistance { get; set; }

        public User? User { get; set; }

        public User? ActionByUser { get; set; }

        public Vehicle? Vehicle { get; set; }

        public List<RequestLocation> Locations { get; set; } = new();
    }
}