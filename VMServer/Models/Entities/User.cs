using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VMServer.Models.Entities
{
    public enum UserRole { Administrator, Employee, Manager }

    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        public required string Username { get; set; }

        [Required]
        public required string PasswordHash { get; set; }

        [Required]
        [MaxLength(255)]
        public required string FullName { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        public required string PhoneNumber { get; set; }

        [Required]
        [EnumDataType(typeof(UserRole))]
        public UserRole Role { get; set; }

        public bool Status { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime LastUpdateAt { get; set; } = DateTime.Now;
    }
}