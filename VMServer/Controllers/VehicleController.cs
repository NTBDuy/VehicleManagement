using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VMServer.Models.DTOs;
using VMServer.Models.Entities;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace VMServer.Controllers
{
    [Route("api/vehicle")]
    [ApiController]
    public class VehicleController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        public VehicleController(AppDbContext dbContext, IConfiguration configuration)
        {
            _dbContext = dbContext;
        }

        // POST: api/vehicle
        [Authorize]
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableVehicles()
        {
            var availableVehicles = await _dbContext.Vehicles
                .Where(v => v.Status == Status.Available)
                .ToListAsync();

            return Ok(availableVehicles);
        }
    }
}