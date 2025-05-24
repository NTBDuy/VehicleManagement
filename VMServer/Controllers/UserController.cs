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

        // GET: api/user/{userId}/requests
        // Lấy danh sách yêu cầu của người dùng
        [Authorize]
        [HttpGet("{userId}/requests")]
        public async Task<IActionResult> GetRequestsByUser(int userId)
        {
            var claimUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (claimUserId == null || int.Parse(claimUserId) != userId)
                return Forbid("You are not allowed to get another user's requests.");

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found!" });

            var requests = await _dbContext.Requests
                .Where(r => r.UserId == userId)
                .Include(r => r.Vehicle)
                .ToListAsync();

            return Ok(requests);
        }

        // PUT: api/user/{userId}
        // Cập nhật thông tin người dùng
        [Authorize]
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUserInformation(int userId, [FromBody] UpdateUserInformationDTO dto)
        {

            var claimUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (claimUserId == null || int.Parse(claimUserId) != userId)
                return Forbid("You are not allowed to update another user's information.");

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