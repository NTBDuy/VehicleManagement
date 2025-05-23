using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VMServer.Models.Entities
{
    public class Driver
    {
        [Key]
        [ForeignKey("User")]
        public int DriverId { get; set; }  

        [Required]
        [MaxLength(50)]
        public string LicenseNumber { get; set; } = null!;

        public DateTime LicenseIssuedDate { get; set; }

        public int YearsOfExperience { get; set; }

        public User? User { get; set; }
    }
}