using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VMServer.Models.Entities
{
    public enum CheckPointType { CheckIn, CheckOut }

    public class CheckPoint
    {
        [Key]
        public int CheckPointId { get; set; }

        [Required]
        [ForeignKey("Request")]
        public int RequestId { get; set; }

        [Column(TypeName = "decimal(18,15)")]
        public required decimal Latitude { get; set; }

        [Column(TypeName = "decimal(18,15)")]
        public required decimal Longitude { get; set; }

        public List<CheckPointPhoto> Photos { get; set; } = new();

        public string? Note { get; set; }

        public required int CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}