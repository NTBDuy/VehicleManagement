using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VMServer.Models.DTOs;
using VMServer.Models.Entities;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Xml;

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

        // GET: api/vehicle
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet]
        public async Task<IActionResult> GetAllVehicle()
        {
            var vehicles = await _dbContext.Vehicles
                .ToListAsync();

            return Ok(vehicles);
        }

        // GET: api/vehicle/{vehicleId}
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet("{vehicleId}")]
        public async Task<IActionResult> GetVehicleDetails(int vehicleId)
        {
            var vehicle = await _dbContext.Vehicles.FindAsync(vehicleId);
            if (vehicle == null)
                return NotFound(new { message = $"Vehicle not found with ID #{vehicleId}" });
            
            return Ok(vehicle);
        }

        // GET: api/vehicle/available
        [Authorize]
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableVehicles()
        {
            var availableVehicles = await _dbContext.Vehicles
                .Where(v => v.Status == Status.Available)
                .ToListAsync();

            return Ok(availableVehicles);
        }

        // POST: api/vehicle
        [Authorize(Roles = "Administrator, Manager")]
        [HttpPost]
        public async Task<IActionResult> CreateNewVehicle([FromBody] VehicleDTO dto)
        {
            var newVehicle = new Vehicle
            {
                LicensePlate = dto.LicensePlate,
                Type = dto.Type,
                Brand = dto.Brand,
                Model = dto.Model,
                Status = Status.Available,
                CreatedAt = DateTime.Now,
                LastUpdateAt = DateTime.Now
            };

            _dbContext.Vehicles.Add(newVehicle);
            await _dbContext.SaveChangesAsync();
            return Ok(newVehicle);
        }

        // PUT: api/vehicle/{vehicleId}
        [Authorize(Roles = "Administrator, Manager")]
        [HttpPut("{vehicleId}")]
        public async Task<IActionResult> UpdateVehicle(int vehicleId, [FromBody] VehicleDTO dto)
        {
            var vehicle = await _dbContext.Vehicles.FindAsync(vehicleId);
            if (vehicle == null)
                return NotFound(new { message = $"Vehicle not found with ID #{vehicleId}" });

            vehicle.LicensePlate = dto.LicensePlate;
            vehicle.Type = dto.Type;
            vehicle.Brand = dto.Brand;
            vehicle.Model = dto.Model;
            vehicle.LastUpdateAt = DateTime.Now;

            await _dbContext.SaveChangesAsync();
            return Ok(vehicle);
        }

        // DELETE: api/vehicle/{vehicleId}
        [Authorize(Roles = "Administrator, Manager")]
        [HttpDelete("{vehicleId}")]
        public async Task<IActionResult> DeleteVehicle(int vehicleId)
        {
            var vehicle = await _dbContext.Vehicles.FindAsync(vehicleId);
            if (vehicle == null)
                return NotFound(new { message = $"Vehicle not found with ID #{vehicleId}" });

            _dbContext.Vehicles.Remove(vehicle);
            await _dbContext.SaveChangesAsync();
            return Ok(new { message = $"Vehicle with ID #{vehicleId} was removed successfully." });
        }
    }
}