using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VMServer.Models.DTOs;
using VMServer.Models.Entities;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace VMServer.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        private readonly PasswordHasher<User> _passwordHasher;

        public UserController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
            _passwordHasher = new PasswordHasher<User>();
        }

        // GET: api/user
        // Lấy danh sách người dùng
        [Authorize(Roles = "Administrator")]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _dbContext.Users.ToListAsync();
            return Ok(users);
        }

        // GET: api/user/{userId}
        // Lấy thông tin chi tiết người dùng
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserDetails(int userId)
        {
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = $"User not found with ID #{userId}" });

            return Ok(new UserDetailsDTO
            {
                UserId = user.UserId,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                Status = user.Status,
                CreatedAt = user.CreatedAt,
                LastUpdateAt = user.LastUpdateAt
            }
            );
        }

        // GET: api/user/notification
        // Lấy danh sách thông báo của người dùng
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

        // GET: api/user/notification/count-unread\
        // Đếm số lượng thông báo chưa đọc
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
        public async Task<IActionResult> GetUserRequests([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var claimUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(claimUserId, out var userId))
                return Forbid("Invalid user identity.");

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found!" });

            var query = _dbContext.Requests
                .Where(r => r.UserId == userId);

            if (startDate.HasValue)
            {
                DateTime start = startDate.Value.Date;
                DateTime end;

                if (!endDate.HasValue || endDate.Value.Date <= start)
                {
                    // Nếu endDate không có hoặc <= startDate, thì lọc trong cùng ngày
                    end = start.AddDays(1).AddTicks(-1);
                }
                else
                {
                    // Lọc từ start đến endDate cuối ngày
                    end = endDate.Value.Date.AddDays(1).AddTicks(-1);
                }

                // Lọc các request có thời gian giao với khoảng đã chọn
                query = query.Where(r => r.StartTime <= end && r.EndTime >= start);

                // Lọc theo trạng thái
                var validStatuses = new[]
                {
            RequestStatus.Approved,
            RequestStatus.Pending,
            RequestStatus.InProgress
        };
                query = query.Where(r => validStatuses.Contains(r.Status));
            }

            var list = await query
                .Include(r => r.Vehicle)
                .Include(r => r.ActionByUser)
                .Include(r => r.Locations)
                .OrderByDescending(r => r.LastUpdateAt)
                .ToListAsync();

            return Ok(list);
        }

        // POST: api/user
        // Tạo mới người dùng
        [Authorize(Roles = "Administrator")]
        [HttpPost]
        public async Task<IActionResult> CreateNewUser([FromBody] UserDTO dto)
        {
            var newUser = new User
            {
                Username = dto.Email.Split('@')[0],
                PasswordHash = _passwordHasher.HashPassword(null!, "P@ssword123"),
                FullName = dto.FullName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                Role = dto.Role,
                Status = true,
                CreatedAt = DateTime.Now,
                LastUpdateAt = DateTime.Now
            };

            _dbContext.Users.Add(newUser);
            await _dbContext.SaveChangesAsync();
            return Ok(newUser);
        }

        // PUT: api/user/{userId}
        // Cập nhật thông tin người dùng
        [Authorize(Roles = "Administrator")]
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUser(int userId, [FromBody] UserDTO dto)
        {
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = $"User not found with ID #{userId}" });

            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.PhoneNumber = dto.PhoneNumber;
            user.Role = dto.Role;
            user.LastUpdateAt = DateTime.Now;

            await _dbContext.SaveChangesAsync();
            return Ok(user);
        }

        // PUT: api/user/{userId}/toggle-status
        // Thay đổi trạng thái người dùng
        [Authorize(Roles = "Administrator")]
        [HttpPut("{userId}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(int userId)
        {
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = $"User not found with ID #{userId}" });

            user.Status = !user.Status;

            await _dbContext.SaveChangesAsync();
            return Ok(new { message = $"User with ID #{userId} has been toggled status successfully." });
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

        // PUT: api/user/{userId}/reset-password
        // Reset mật khẩu cho người dùng
        [Authorize(Roles = "Administrator")]
        [HttpPut("{userId}/reset-password")]
        public async Task<IActionResult> ResetUserPassword(int userId)
        {
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = $"User not found with ID #{userId}" });

            user.PasswordHash = _passwordHasher.HashPassword(user, "P@ssword123");
            user.LastUpdateAt = DateTime.Now;

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = $"Password has been reset for user ID #{userId}. New password: P@ssword123" });
        }

        // PUT: api/user/change-password
        // Thay đổi mật khẩu
        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
        {
            var claimUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(claimUserId, out var userId))
                return Forbid("Invalid user identity.");

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found!" });

            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.CurrentPassword);
            if (verificationResult == PasswordVerificationResult.Failed)
                return BadRequest(new { message = "Current password is incorrect!" });

            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
                return BadRequest(new { message = "New password must be at least 6 characters long!" });

            if (dto.NewPassword != dto.ConfirmPassword)
                return BadRequest(new { message = "New password and confirm password do not match!" });

            user.PasswordHash = _passwordHasher.HashPassword(user, dto.NewPassword);
            user.LastUpdateAt = DateTime.Now;

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully!" });
        }
    }
}