using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YouMedServer.Models.Entities
{
    public class Assignment
    {
        [Key]
        public int AssignmentId { get; set; }

        [Required]
        [ForeignKey("Request")]
        public int RequestId { get; set; }

        [Required]
        [ForeignKey("Driver")]
        public int DriverId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Note { get; set; } = null!;

        public Request? Request { get; set; }
        public User? Driver { get; set; }
    }
}