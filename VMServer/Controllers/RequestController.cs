using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VMServer.Models.DTOs;
using VMServer.Models.Entities;
using System.Security.Claims;

namespace VMServer.Controllers
{
    [Route("api/request")]
    [ApiController]
    public class RequestController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        public RequestController(AppDbContext dbContext, IConfiguration configuration)
        {
            _dbContext = dbContext;
        }

        // POST: api/request
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> NewRequest([FromBody] CreateNewRequestDTO dto)
        {
            var user = await _dbContext.Users.FindAsync(dto.UserId);
            if (user == null)
                return NotFound(new { message = "User not found with id ", dto.UserId });

            var vehicle = await _dbContext.Vehicles.FindAsync(dto.VehicleId);
            if (vehicle == null)
                return NotFound(new { message = "Vehicle not found with id ", dto.VehicleId });

            var newRequest = new Request
            {
                UserId = dto.UserId,
                VehicleId = dto.VehicleId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Purpose = dto.Purpose,
                IsDriverRequired = dto.IsDriverRequired,
                Status = RequestStatus.Pending
            };

            _dbContext.Requests.Add(newRequest);
            await _dbContext.SaveChangesAsync();

            return Ok(newRequest);
        }
    }
}