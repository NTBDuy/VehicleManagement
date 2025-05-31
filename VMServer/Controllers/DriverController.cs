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
    }
}