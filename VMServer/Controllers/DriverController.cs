using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VMServer.Models.DTOs;
using VMServer.Models.Entities;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace VMServer.Controllers
{
    [Route("api/driver")]
    [ApiController]
    public class DriverController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        public DriverController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/driver
        // Lấy danh sách tài xế 
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet]
        public async Task<IActionResult> GetDrivers()
        {
            var drivers = await _dbContext.Drivers.ToListAsync();
            return Ok(drivers);
        }

        // GET: api/driver/available
        // Lấy danh sách tài xế khả dụng
        // [Authorize(Roles = "Administrator, Manager")]
        [HttpGet("available")]
        public async Task<IActionResult> GetDriversAvailable([FromQuery] DateTime startTime, [FromQuery] DateTime endTime)
        {
            var requestIds = await _dbContext.Requests
                .Where(r => (r.Status == RequestStatus.Pending || r.Status == RequestStatus.Approved)
                            && (r.IsDriverRequired == true)
                            && r.StartTime <= endTime && r.EndTime >= startTime)
                .Select(r => r.RequestId)
                .Distinct()
                .ToListAsync();

            var assignmentsConflict = await _dbContext.Assignments
                .Where(a => requestIds.Contains(a.RequestId))
                .Select(a => a.DriverId)
                .Distinct()
                .ToListAsync();

            var driversAvailable = await _dbContext.Drivers
                .Where(a => !assignmentsConflict.Contains(a.DriverId))
                .ToListAsync();

            return Ok(driversAvailable);
        }

        // GET: api/driver/{driverId}
        // Lấy tài xế chi tiết 
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet("{driverId}")]
        public async Task<IActionResult> GetDriverDetails(int driverId)
        {
            var driver = await _dbContext.Drivers.FindAsync(driverId);
            if (driver == null)
                return NotFound(new { message = $"Driver not found with ID #{driverId}" });

            return Ok(driver);
        }

        // POST: api/driver
        // Tạo mới tài xế
        [Authorize(Roles = "Administrator")]
        [HttpPost]
        public async Task<IActionResult> CreateNewDriver([FromBody] DriverDTO dto)
        {
            var newDriver = new Driver
            {
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                LicenseNumber = dto.LicenseNumber,
                LicenseIssuedDate = dto.LicenseIssuedDate,
                YearsOfExperience = dto.YearsOfExperience,
                CreatedAt = DateTime.Now,
                LastUpdateAt = DateTime.Now,
                IsActive = true
            };

            _dbContext.Drivers.Add(newDriver);
            await _dbContext.SaveChangesAsync();
            return Ok(newDriver);
        }

        // PUT: api/driver/{driverId}
        // Cập nhật thông tin tài xế
        [Authorize(Roles = "Administrator")]
        [HttpPut("{driverId}")]
        public async Task<IActionResult> UpdateDriver(int driverId, [FromBody] DriverDTO dto)
        {
            var driver = await _dbContext.Drivers.FindAsync(driverId);
            if (driver == null)
                return NotFound(new { message = $"Driver not found with ID #{driverId}" });

            driver.FullName = dto.FullName;
            driver.PhoneNumber = dto.PhoneNumber;
            driver.LicenseNumber = dto.LicenseNumber;
            driver.LicenseIssuedDate = dto.LicenseIssuedDate;
            driver.YearsOfExperience = dto.YearsOfExperience;
            driver.LastUpdateAt = DateTime.Now;

            await _dbContext.SaveChangesAsync();
            return Ok(driver);
        }

        // PUT: api/driver/{driverId}/toggle-status
        // Thay đổi trạng thái tài xế
        [Authorize(Roles = "Administrator")]
        [HttpPut("{driverId}/toggle-status")]
        public async Task<IActionResult> ToggleDriverStatus(int driverId)
        {
            var driver = await _dbContext.Drivers.FindAsync(driverId);
            if (driver == null)
                return NotFound(new { message = $"Driver not found with ID #{driverId}" });

            driver.IsActive = !driver.IsActive;
            driver.LastUpdateAt = DateTime.Now;

            await _dbContext.SaveChangesAsync();
            return Ok(new { message = $"Driver with ID #{driverId} has been toggled status successfully." });
        }
    }
}