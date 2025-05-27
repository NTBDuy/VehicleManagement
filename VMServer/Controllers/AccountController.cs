using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VMServer.Models.DTOs;
using VMServer.Models.Entities;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Xml;
using Microsoft.AspNetCore.Identity;

namespace VMServer.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        private readonly PasswordHasher<User> _passwordHasher;
        public AccountController(AppDbContext dbContext, IConfiguration configuration)
        {
            _dbContext = dbContext;
            _passwordHasher = new PasswordHasher<User>();
        }

        // GET: api/account
        [Authorize(Roles = "Administrator")]
        [HttpGet]
        public async Task<IActionResult> GetAllAccounts()
        {
            var accounts = await _dbContext.Users.ToListAsync();
            return Ok(accounts);
        }

        // GET: api/account/{accountId}
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet("{accountId}")]
        public async Task<IActionResult> GetAccountDetails(int accountId)
        {
            var account = await _dbContext.Users.FindAsync(accountId);
            if (account == null)
                return NotFound(new { message = $"Account not found with ID #{accountId}" });
            
            return Ok(account);
        }

        // POST: api/account
        [Authorize(Roles = "Administrator")]
        [HttpPost]
        public async Task<IActionResult> CreateNewAccount([FromBody] AccountDTO dto)
        {
            var newAccount = new User
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

            _dbContext.Users.Add(newAccount);
            await _dbContext.SaveChangesAsync();
            return Ok(newAccount);
        }

        // PUT: api/account/{accountId}
        [Authorize(Roles = "Administrator")]
        [HttpPut("{accountId}")]
        public async Task<IActionResult> UpdateAccount(int accountId, [FromBody] AccountDTO dto)
        {
            var account = await _dbContext.Users.FindAsync(accountId);
            if (account == null)
                return NotFound(new { message = $"Account not found with ID #{accountId}" });

            account.FullName = dto.FullName;
            account.Email = dto.Email;
            account.PhoneNumber = dto.PhoneNumber;
            account.Role = dto.Role;
            account.LastUpdateAt = DateTime.Now;

            await _dbContext.SaveChangesAsync();
            return Ok(account);
        }

        // DELETE: api/account/{accountId}
        [Authorize(Roles = "Administrator")]
        [HttpDelete("{accountId}")]
        public async Task<IActionResult> DeleteAccount(int accountId)
        {
            var account = await _dbContext.Users.FindAsync(accountId);
            if (account == null)
                return NotFound(new { message = $"Account not found with ID #{accountId}" });

            _dbContext.Users.Remove(account);
            await _dbContext.SaveChangesAsync();
            return Ok(new { message = $"Account with ID #{accountId} was removed successfully." });
        }
    }
}