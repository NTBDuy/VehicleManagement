using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VMServer.Models.DTOs;
using VMServer.Models.Entities;

namespace VMServer.Controllers
{
    [Route("api/statistic")]
    [ApiController]
    public class StatisticController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public StatisticController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/statistic/requests
        // Trả về thống kê yêu cầu theo khoảng thời gian và trạng thái (nếu có)
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet("requests")]
        public async Task<IActionResult> GetRequestsByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] RequestStatus? status)
        {
            var filteredRequests = _dbContext.Requests.Where(r => r.StartTime >= startDate && r.StartTime <= endDate);

            if (status.HasValue)
            {
                filteredRequests = filteredRequests.Where(r => r.Status == status);
            }

            var requestList = await filteredRequests
                .Include(r => r.User)
                .Include(r => r.Vehicle)
                .Include(r => r.ActionByUser)
                .Include(r => r.Locations)
                .Select(r => new
                {
                    r.RequestId,
                    r.StartTime,
                    r.Status,
                    User = r.User == null ? null : new
                    {
                        r.User.FullName
                    }
                })
                .ToListAsync();

            return Ok(requestList);
        }

        // GET: api/statistic/vehicle-most-usage
        // Trả về thống kê phương tiện được sử dụng nhiều nhất trong khoảng thời gian
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet("vehicle-most-usage")]
        public async Task<IActionResult> VehicleMostUsage(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] RequestStatus? status)
        {
            var query = _dbContext.Requests
                .Where(r => r.StartTime >= startDate && r.StartTime <= endDate);

            if (status.HasValue)
            {
                query = query.Where(r => r.Status == status.Value);
            }

            var usageList = await query
                .GroupBy(r => r.VehicleId)
                .Select(g => new
                {
                    VehicleId = g.Key,
                    Count = g.Count(),
                    TotalDistance = g.Sum(r => r.TotalDistance ?? 0)
                })
                .OrderByDescending(g => g.Count)
                .ToListAsync();

            var vehicleIds = usageList.Select(u => u.VehicleId).ToList();

            var vehicles = await _dbContext.Vehicles
                .Where(v => vehicleIds.Contains(v.VehicleId))
                .ToDictionaryAsync(v => v.VehicleId, v => v.LicensePlate);

            var result = usageList.Select(u => new
            {
                LicensePlate = vehicles.ContainsKey(u.VehicleId) ? vehicles[u.VehicleId] : null,
                Count = u.Count,
                TotalDistance = u.TotalDistance
            });

            return Ok(result);
        }

        // GET: api/statistic/request-per-day
        // Trả về thống kê số lượt yêu cầu trên từng ngày
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet("request-per-day")]
        public async Task<IActionResult> RequestPerDay([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] RequestStatus? status)
        {
            var query = _dbContext.Requests
                            .Where(r => r.StartTime >= startDate && r.StartTime <= endDate);

            if (status.HasValue)
            {
                query = query.Where(r => r.Status == status.Value);
            }

            var list = await query
                .GroupBy(r => r.StartTime.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(g => g.Count)
                .ToListAsync();

            var result = list.Select(u => new
            {
                Date = u.Date,
                Count = u.Count
            });

            return Ok(result);
        }

        // GET: api/statistic/user-most-request
        // Trả về thống kê những người dùng đặt yêu cầu 
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet("user-most-request")]
        public async Task<IActionResult> UserMostRequest(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] RequestStatus? status)
        {
            var query = _dbContext.Requests
                .Where(r => r.StartTime >= startDate && r.StartTime <= endDate);

            if (status.HasValue)
            {
                query = query.Where(r => r.Status == status.Value);
            }

            var list = await query
                .GroupBy(r => r.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(g => g.Count)
                .ToListAsync();

            var userIds = list.Select(u => u.UserId).ToList();

            var users = await _dbContext.Users
                .Where(v => userIds.Contains(v.UserId))
                .ToDictionaryAsync(v => v.UserId, v => v.Username);

            var result = list.Select(u => new
            {
                Username = users.ContainsKey(u.UserId) ? users[u.UserId] : "Unknown",
                Count = u.Count
            });

            return Ok(result);
        }


        // GET: api/statistic/vehicle-usage
        // Trả về thống kê phương tiện được sử dụng nhiều nhất toàn thời gian
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet("vehicle-usage")]
        public async Task<IActionResult> VehicleUsage()
        {
            var usageData = await _dbContext.Requests
                .GroupBy(r => r.VehicleId)
                .Select(g => new
                {
                    VehicleId = g.Key,
                    RequestCount = g.Count(),
                    TotalDistance = g.Sum(r => r.TotalDistance ?? 0)
                })
                .ToListAsync();

            var vehicles = await _dbContext.Vehicles.ToListAsync();

            var result = vehicles.Select(v =>
            {
                var usage = usageData.FirstOrDefault(u => u.VehicleId == v.VehicleId);
                return new
                {
                    LicensePlate = v.LicensePlate,
                    Count = usage?.RequestCount ?? 0,
                    TotalDistance = usage?.TotalDistance ?? 0
                };
            })
            .Where(x => x.Count > 0)
            .OrderByDescending(x => x.Count)
            .ToList();

            return Ok(result);
        }
    }
}