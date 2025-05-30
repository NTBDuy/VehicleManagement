using VMServer.Models.Entities;

namespace VMServer.Models.DTOs
{
    public class UserDetailsDTO
    {
        public int UserId { get; set; }

        public required string Username { get; set; }

        public required string FullName { get; set; }

        public required string Email { get; set; }

        public required string PhoneNumber { get; set; }

        public UserRole Role { get; set; }

        public bool Status { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime LastUpdateAt { get; set; } = DateTime.Now;
    }
}