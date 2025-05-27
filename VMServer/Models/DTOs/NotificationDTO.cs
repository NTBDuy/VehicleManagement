using VMServer.Models.Entities;

namespace VMServer.Models.DTOs
{
    public class NotificationDTO
    {
        public int UserId { get; set; }

        public string Message { get; set; } = null!;

        public string Type { get; set; } = null!;
    }
}