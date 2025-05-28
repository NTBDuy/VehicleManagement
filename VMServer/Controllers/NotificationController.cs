using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VMServer.Models.DTOs;
using VMServer.Models.Entities;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace VMServer.Controllers
{
    [Route("api/notification")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        public NotificationController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // POST: api/notification
        // Thêm mới thông báo
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateNewNotification([FromBody] NotificationDTO dto)
        {
            var user = await _dbContext.Users.FindAsync(dto.UserId);
            if (user == null)
                return NotFound(new { message = "User not found!" });

            var newNotifications = new Notification
            {
                UserId = dto.UserId,
                Message = dto.Message,
                Type = dto.Type,
            };

            _dbContext.Notifications.Add(newNotifications);
            await _dbContext.SaveChangesAsync();
            return Ok(newNotifications);
        }

        // PUT: api/notification/{notificationId}/mark-read
        // Đánh dấu thông báo đã đọc 
        [Authorize]
        [HttpPut("{notificationId}/mark-read")]
        public async Task<IActionResult> MarkNotificationAsRead(int notificationId)
        {
            var notification = await _dbContext.Notifications.FindAsync(notificationId);
            if (notification == null)
                return NotFound(new { message = "Notification not found!" });

            var claimUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(claimUserId, out var userId))
                return Forbid("Invalid user identity.");

            if (notification.UserId != userId)
                return Forbid("You are not authorized to update this notification.");

            notification.IsRead = true;

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Notification marked as read." });
        }

        // PUT: api/notification/mark-all-read
        // Đánh dấu đã đọc toàn bộ thông báo 
        [Authorize]
        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllNotificationsAsRead()
        {
            var claimUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(claimUserId, out var userId))
                return Forbid("Invalid user identity.");

            var unreadNotifications = await _dbContext.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            if (!unreadNotifications.Any())
                return Ok(new { message = "No unread notifications." });

            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "All notifications marked as read." });
        }
    }
}