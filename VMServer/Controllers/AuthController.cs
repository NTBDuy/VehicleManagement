using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VMServer.Models.Entities;
using VMServer.Models.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace VMServer.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        private readonly PasswordHasher<User> _passwordHasher;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext dbContext, IConfiguration configuration)
        {
            _dbContext = dbContext;
            _passwordHasher = new PasswordHasher<User>();
            _configuration = configuration;
        }

        // POST: api/auth/login
        // Đăng nhập bằng tên đăng nhập và mật khẩu
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);

            if (user == null)
                return Unauthorized(new { message = "Invalid credentials." });

            var passwordVerificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (passwordVerificationResult == PasswordVerificationResult.Failed)
                return Unauthorized(new { message = "Invalid credentials." });

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token = token,
                user = new
                {
                    userID = user.UserID,
                    username = user.Username,
                    fullName = user.FullName,
                    phoneNumber = user.PhoneNumber,
                    email = user.Email,
                    role = user.Role
                }
            });
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _dbContext.Users.ToListAsync();
            return Ok(users);
        }

        // PUT: api/user
        // Cập nhật thông tin người dùng
        [Authorize]
        [HttpPut("/api/user/{userId}")]
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

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            var keyString = _configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(keyString))
                throw new InvalidOperationException("JWT key is not configured in appsettings.");

            var key = Encoding.ASCII.GetBytes(keyString);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
            new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email ?? ""),
            new Claim(ClaimTypes.Role, user.Role.ToString())

        }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}