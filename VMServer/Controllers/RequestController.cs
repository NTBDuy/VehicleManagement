using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VMServer.Models.DTOs;
using VMServer.Models.Entities;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

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
        // GET: apo/requests
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet("/api/requests")]
        public async Task<IActionResult> GetAllRequests()
        {
            var requests = await _dbContext.Requests
                .Include(r => r.User)
                .Include(r => r.Vehicle)
                .ToListAsync();
            return Ok(requests);
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

        // PUT: api/request/{requestId}/approve
        [Authorize]
        [HttpPut("{requestId}/approve")]
        public async Task<IActionResult> ApproveRequest(int requestId, [FromBody] ApproveDTO? dto)
        {
            var request = await _dbContext.Requests
                    .Include(r => r.User)
                    .Include(r => r.Vehicle)
                    .FirstOrDefaultAsync(r => r.RequestId == requestId);
                    
            if (request == null)
                return NotFound(new { message = $"Request not found with ID #{requestId}" });

            if (dto != null)
            {
                var driver = await _dbContext.Drivers.FindAsync(dto.DriverId);
                if (driver == null)
                    return NotFound(new { message = $"Driver not found with ID #{dto.DriverId}" });

                var newAssign = new Assignment
                {
                    DriverId = dto.DriverId,
                    RequestId = requestId,
                    Note = dto.Note,
                };

                _dbContext.Assignments.Add(newAssign);
            }

            request.Status = RequestStatus.Approved;
            await _dbContext.SaveChangesAsync();

            return Ok(request);
        }
    }
}