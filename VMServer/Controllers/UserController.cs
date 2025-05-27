using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VMServer.Models.DTOs;
using VMServer.Models.Entities;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace VMServer.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        public UserController(AppDbContext dbContext, IConfiguration configuration)
        {
            _dbContext = dbContext;
        }

        // GET: api/user/notification
        [Authorize]
        [HttpGet("notifications")]
        public async Task<IActionResult> GetUserNotifications()
        {
            var claimUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(claimUserId, out var userId))
                return Forbid("Invalid user identity.");

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found!" });

            var notifications = await _dbContext.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        // GET: api/user/notification/count-unread
        [Authorize]
        [HttpGet("notifications/count-unread")]
        public async Task<IActionResult> GetUserNotificationsUnread()
        {
            var claimUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(claimUserId, out var userId))
                return Forbid("Invalid user identity.");

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found!" });

            var count = await _dbContext.Notifications
                .Where(n => n.UserId == userId && n.IsRead == false)
                .CountAsync();

            return Ok(count);
        }

        // GET: api/user/requests
        // Lấy danh sách yêu cầu của người dùng
        [Authorize]
        [HttpGet("requests")]
        public async Task<IActionResult> GetUserRequests()
        {
            var claimUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(claimUserId, out var userId))
                return Forbid("Invalid user identity.");

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found!" });

            var requests = await _dbContext.Requests
                .Where(r => r.UserId == userId)
                .Include(r => r.Vehicle)
                .OrderByDescending(r => r.LastUpdateAt)
                .ToListAsync();

            return Ok(requests);
        }

        // PUT: api/user/information
        // Cập nhật thông tin người dùng
        [Authorize]
        [HttpPut("information")]
        public async Task<IActionResult> UpdateUserInformation([FromBody] UpdateUserInformationDTO dto)
        {
            var claimUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(claimUserId, out var userId))
                return Forbid("Invalid user identity.");

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found!" });

            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.PhoneNumber = dto.PhoneNumber;

            await _dbContext.SaveChangesAsync();

            return Ok(user);
        }
    }
}