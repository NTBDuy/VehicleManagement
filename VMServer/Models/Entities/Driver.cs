using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VMServer.Models.Entities
{
    public class Driver
    {
        [Key]
        public int DriverId { get; set; }

        [Required]
        [MaxLength(255)]
        public string FullName { get; set; } = null!;

        [Required]
        public string PhoneNumber { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string LicenseNumber { get; set; } = null!;

        public DateTime LicenseIssuedDate { get; set; }

        public int YearsOfExperience { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime LastUpdateAt { get; set; } = DateTime.Now;
    }
}