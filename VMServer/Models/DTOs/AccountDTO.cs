using VMServer.Models.Entities;

namespace VMServer.Models.DTOs
{
    public class AccountDTO
    {
        public required string FullName { get; set; }

        public required string Email { get; set; }

        public required string PhoneNumber { get; set; }

        public UserRole Role { get; set; }
    }
}