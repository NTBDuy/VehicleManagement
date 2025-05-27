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

        // GET: api/vehicle/{vehicleId}/schedule
        [Authorize]
        [HttpGet("{vehicleId}/schedule")]
        public async Task<IActionResult> GetVehicleSchedule(int vehicleId)
        {
            var vehicle = await _dbContext.Vehicles.FindAsync(vehicleId);
            if (vehicle == null)
                return NotFound(new { message = $"Vehicle not found with ID #{vehicleId}" });

            var schedules = await _dbContext.Requests
                .Include(r => r.User)
                .Where(r => r.VehicleId == vehicleId && r.Status == RequestStatus.Approved)
                .OrderByDescending(r => r.StartTime)
                .ToListAsync();

            return Ok(schedules);
        }

        [HttpGet("{vehicleId}/schedule-maintenance")]
        public async Task<IActionResult> GetScheduleMaintenance(int vehicleId)
        {
            var vehicle = await _dbContext.Vehicles.FindAsync(vehicleId);
            if (vehicle == null)
                return NotFound(new { message = "Vehicle not found." });

            var nextMaintenance = await _dbContext.MaintenanceSchedules
                .FirstOrDefaultAsync(m => m.VehicleId == vehicleId);
            if (nextMaintenance == null)
                return NotFound(new { message = "This vehicle does not have a scheduled maintenance." });

            return Ok(nextMaintenance);
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

        [HttpPost("{vehicleId}/schedule-maintenance")]
        public async Task<IActionResult> ScheduleMaintenance(int vehicleId, [FromBody] MaintenanceScheduleDTO dto)
        {
            var vehicle = await _dbContext.Vehicles.FindAsync(vehicleId);
            if (vehicle == null)
                return NotFound(new { message = "Vehicle not found!" });

            var newSchedule = new MaintenanceSchedule
            {
                VehicleId = vehicleId,
                ScheduledDate = dto.ScheduledDate,
                Description = dto.Description
            };

            _dbContext.MaintenanceSchedules.Add(newSchedule);
            await _dbContext.SaveChangesAsync(); 

            vehicle.NextMaintenanceId = newSchedule.MaintenanceId;
            vehicle.NextMaintenance = dto.ScheduledDate;
            await _dbContext.SaveChangesAsync();
            return Ok(newSchedule);
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