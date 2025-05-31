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
        public VehicleController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/vehicle
        // Lấy danh sách tất cả phương tiện
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet]
        public async Task<IActionResult> GetAllVehicle()
        {
            var vehicles = await _dbContext.Vehicles
                .ToListAsync();

            return Ok(vehicles);
        }

        // GET: api/vehicle/{vehicleId}
        // Lấy thông tin chi tiết phương tiện
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
        // Lấy phương tiện đang khả dụng trong khoảng thời gian
        // [Authorize]
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableVehicles([FromQuery] DateTime startTime, [FromQuery] DateTime endTime)
        {
            var conflictingVehicleIds = await _dbContext.Requests
                .Where(r => (r.Status == RequestStatus.Pending || r.Status == RequestStatus.Approved)
                            && r.StartTime <= endTime && r.EndTime >= startTime)
                .Select(r => r.VehicleId)
                .Distinct()
                .ToListAsync();

            var availableVehicles = await _dbContext.Vehicles
                .Where(v => v.Status == Status.Available && !conflictingVehicleIds.Contains(v.VehicleId))
                .ToListAsync();

            return Ok(availableVehicles);
        }

        // GET: api/vehicle/{vehicleId}/schedule
        // Lấy yêu cầu (lịch trình) của phương tiện đó
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

        // GET: api/vehicle/maintenance
        // Lấy tẩt cả lịch bảo dưỡng
        [Authorize]
        [HttpGet("maintenance")]
        public async Task<IActionResult> GetAllMaintenance()
        {
            var maintenance = await _dbContext.MaintenanceSchedules
                .Include(m => m.Vehicle)
                .ToListAsync();

            return Ok(maintenance);
        }

        // GET: api/vehicle/{vehicleId}/maintenance/schedule
        // Lấy thông tin lịch bảo dưỡng sắp đến
        [Authorize]
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
        // Tạo mới phương tiện
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

        // POST: api/vehicle/{vehicleId}/maintenance/schedule
        // Thêm lịch bảo dưỡng cho phương tiện
        [Authorize]
        [HttpPost("{vehicleId}/maintenance/schedule")]
        public async Task<IActionResult> ScheduleMaintenance(int vehicleId, [FromBody] MaintenanceScheduleDTO dto)
        {
            var vehicle = await _dbContext.Vehicles.FindAsync(vehicleId);
            if (vehicle == null)
                return NotFound(new { message = "Vehicle not found!" });

            var EstimatedEndDate = dto.ScheduledDate.AddDays(dto.EstimatedDurationInDays);

            var hasConflict = await _dbContext.Requests
                    .AnyAsync(r => r.VehicleId == vehicleId &&
                                    r.StartTime <= EstimatedEndDate &&
                                    r.EndTime >= dto.ScheduledDate);

            if (hasConflict)
                return BadRequest(new { message = "This vehicle has schedule at that day" });

            var newSchedule = new MaintenanceSchedule
            {
                VehicleId = vehicleId,
                ScheduledDate = dto.ScheduledDate,
                EstimatedEndDate = EstimatedEndDate,
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
        // Cập nhật thông tin phương tiện
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

        // PUT: api/vehicle/maintenance/{maintenanceId}/reschedule
        // Thay đổi thời gian bảo dưỡng
        [Authorize(Roles = "Administrator, Manager")]
        [HttpPut("maintenance/{maintenanceId}/reschedule")]
        public async Task<IActionResult> RescheduleMaintenance(int maintenanceId, [FromBody] RescheduleMaintenanceDTO dto)
        {
            var maintenance = await _dbContext.MaintenanceSchedules
                .Include(m => m.Vehicle)
                .FirstOrDefaultAsync(m => m.MaintenanceId == maintenanceId);

            if (maintenance == null)
                return NotFound(new { message = $"Maintenance not found ID #{maintenanceId}" });

            var hasConflict = await _dbContext.Requests
                    .AnyAsync(r => r.VehicleId == maintenance.VehicleId &&
                                    r.StartTime <= dto.EndDate &&
                                    r.EndTime >= dto.StartDate);

            if (hasConflict)
                return BadRequest(new { message = "This vehicle has schedule at that day" });

            maintenance.ScheduledDate = dto.StartDate;
            maintenance.EstimatedEndDate = dto.EndDate;
            maintenance.LastUpdateAt = DateTime.Now;

            await _dbContext.SaveChangesAsync();
            return Ok(maintenance);
        }

        // PUT: api/vehicle/maintenance/{maintenanceId}/status?=status
        // Thay đổi trạng thái bảo dưỡng
        [Authorize(Roles = "Administrator, Manager")]
        [HttpPut("maintenance/{maintenanceId}/status")]
        public async Task<IActionResult> BeginMaintenance(int maintenanceId, [FromQuery] MaintenanceStatus status)
        {
            var maintenance = await _dbContext.MaintenanceSchedules
                .Include(m => m.Vehicle)
                .FirstOrDefaultAsync(m => m.MaintenanceId == maintenanceId);

            if (maintenance == null)
                return NotFound(new { message = $"Maintenance not found ID #{maintenanceId}" });

            var vehicle = await _dbContext.Vehicles.FindAsync(maintenance.VehicleId);
            if (vehicle == null)
                return NotFound(new { message = $"Vehicle not found ID #{maintenanceId}" });

            if (status == MaintenanceStatus.InProgress)
                vehicle.Status = Status.UnderMaintenance;
            else if (status == MaintenanceStatus.Done)
                vehicle.Status = Status.Available;

            maintenance.Status = status;
            maintenance.LastUpdateAt = DateTime.Now;

            await _dbContext.SaveChangesAsync();
            return Ok(maintenance);
        }

        // DELETE: api/vehicle/{vehicleId}
        // Xoá phương tiện
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