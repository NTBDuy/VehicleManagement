using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VMServer.Models.Entities
{
    public class RequestLocation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Request")]
        public int RequestId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = null!;

        [MaxLength(255)]
        public string Address { get; set; } = null!;

        [MaxLength(255)]
        public string? Note { get; set; }

        [Column(TypeName = "decimal(10,6)")]
        [Required]
        public decimal Latitude { get; set; }

        [Column(TypeName = "decimal(10,6)")]
        [Required]
        public decimal Longitude { get; set; }

        [Required]
        public int Order { get; set; }
    }
}