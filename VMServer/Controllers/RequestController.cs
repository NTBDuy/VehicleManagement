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
        public RequestController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        // GET: api/request
        // Lấy danh sách toàn bộ yêu cầu
        [Authorize(Roles = "Administrator, Manager")]
        [HttpGet]
        public async Task<IActionResult> GetAllRequests()
        {
            var requests = await _dbContext.Requests
                .Include(r => r.User)
                .Include(r => r.Vehicle)
                .Include(r => r.ActionByUser)
                .OrderByDescending(r => r.LastUpdateAt)
                .ToListAsync();
            return Ok(requests);
        }

        // GET: api/request/{requestId}/assignment
        // Lấy thông tin gán định tài xế
        [Authorize]
        [HttpGet("{requestId}/assignment")]
        public async Task<IActionResult> GetAssignmentDetails(int requestId)
        {
            var request = await _dbContext.Requests.FindAsync(requestId);
            if (request == null)
                return NotFound(new { message = "Request not found!" });

            var assignment = await _dbContext.Assignments
                .Where(a => a.RequestId == requestId)
                .Include(a => a.Driver)
                .FirstOrDefaultAsync();

            if (assignment == null)
                return NotFound(new { message = "Assignment not found!" });

            return Ok(assignment);
        }

        // POST: api/request
        // Tạo mới yêu cầu
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

            if (dto.EndTime < dto.StartTime)
                return BadRequest(new { message = "End time must be after start time" });

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

            await SendNotificationToRole(UserRole.Manager, "A new vehicle request has been submitted and needs approval.", "NewRequestSubmitted");

            var newNotifications = new Notification
            {
                UserId = dto.UserId,
                Message = "A new vehicle request has been successfully created and is pending your approval.",
                Type = "SendRequestSuccess",
            };
            _dbContext.Notifications.Add(newNotifications);


            _dbContext.Requests.Add(newRequest);
            await _dbContext.SaveChangesAsync();

            return Ok(newRequest);
        }

        // PUT: api/request/{requestId}/approve
        // Chấp nhận yêu cầu
        [Authorize(Roles = "Manager")]
        [HttpPut("{requestId}/approve")]
        public async Task<IActionResult> ApproveRequest(int requestId, [FromBody] ApproveDTO? dto)
        {
            var request = await _dbContext.Requests
                .Include(r => r.User)
                .Include(r => r.ActionByUser)
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

            var claimUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(claimUserId, out var userId))
                return Forbid("Invalid user identity.");

            var approveByUser = await _dbContext.Users.FindAsync(userId);
            if (approveByUser == null)
                return Forbid("Approving user not found.");

            request.ActionByUser = approveByUser;
            request.ActionBy = userId;
            request.Status = RequestStatus.Approved;
            request.LastUpdateAt = DateTime.Now;

            var newNotifications = new Notification
            {
                UserId = request.UserId,
                Message = "Your vehicle reservation has been approved.",
                Type = "RequestApproved",
            };

            _dbContext.Notifications.Add(newNotifications);

            await _dbContext.SaveChangesAsync();

            return Ok(request);
        }

        // PUT: api/request/{requestId}/cancel
        // Huỷ bỏ yêu cầu 
        [Authorize]
        [HttpPut("{requestId}/cancel")]
        public async Task<IActionResult> CancelRequest(int requestId, [FromBody] ReasonDTO dto)
        {
            var request = await _dbContext.Requests
                .Include(r => r.User)
                .Include(r => r.Vehicle)
                .Include(r => r.ActionByUser)
                .FirstOrDefaultAsync(r => r.RequestId == requestId);

            if (request == null)
                return NotFound(new { message = $"Request not found with ID #{requestId}" });


            var claimUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(claimUserId, out var userId))
                return Forbid("Invalid user identity.");

            var approveByUser = await _dbContext.Users.FindAsync(userId);
            if (approveByUser == null)
                return Forbid("Approving user not found.");

            request.ActionByUser = approveByUser;
            request.ActionBy = userId;
            request.CancelOrRejectReason = dto.Reason;
            request.Status = RequestStatus.Cancelled;
            request.LastUpdateAt = DateTime.Now;

            var newNotifications = new Notification
            {
                UserId = request.UserId,
                Message = "Your vehicle reservation has been cancelled.",
                Type = "RequestCancelled",
            };

            _dbContext.Notifications.Add(newNotifications);

            await _dbContext.SaveChangesAsync();

            return Ok(request);
        }

        // PUT: api/request/{requestId}/reject
        // Từ chối yêu cầu
        [Authorize(Roles = "Manager")]
        [HttpPut("{requestId}/reject")]
        public async Task<IActionResult> RejectRequest(int requestId, [FromBody] ReasonDTO dto)
        {
            var request = await _dbContext.Requests
                .Include(r => r.User)
                .Include(r => r.Vehicle)
                .Include(r => r.ActionByUser)
                .FirstOrDefaultAsync(r => r.RequestId == requestId);

            if (request == null)
                return NotFound(new { message = $"Request not found with ID #{requestId}" });

            var claimUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(claimUserId, out var userId))
                return Forbid("Invalid user identity.");

            var approveByUser = await _dbContext.Users.FindAsync(userId);
            if (approveByUser == null)
                return Forbid("Approving user not found.");

            request.ActionByUser = approveByUser;
            request.ActionBy = userId;
            request.CancelOrRejectReason = dto.Reason;
            request.Status = RequestStatus.Rejected;
            request.LastUpdateAt = DateTime.Now;

            var newNotifications = new Notification
            {
                UserId = request.UserId,
                Message = "Your vehicle reservation has been rejected.",
                Type = "RequestRejected",
            };

            _dbContext.Notifications.Add(newNotifications);

            await _dbContext.SaveChangesAsync();

            return Ok(request);
        }

        // PUT: api/request/{requestId}/start-using
        // Bắt đầu sử dụng phương tiện
        [Authorize]
        [HttpPut("{requestId}/start-using")]
        public async Task<IActionResult> UsingVehicle(int requestId)
        {
            var request = await _dbContext.Requests
               .Include(r => r.User)
               .Include(r => r.Vehicle)
               .Include(r => r.ActionByUser)
               .FirstOrDefaultAsync(r => r.RequestId == requestId);

            if (request == null)
                return NotFound(new { message = $"Request not found with ID #{requestId}" });

            if (request.Status != RequestStatus.Approved)
                return BadRequest(new { message = "Request must be approved before starting usage" });

            var claimUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(claimUserId, out var userId))
                return Forbid("Invalid user identity.");

            if (userId != request.UserId)
                return Forbid("You are not authorized to start this request.");

            if (request.Vehicle == null)
                return BadRequest(new { message = "Vehicle not found" });

            request.Vehicle.Status = Status.InUse;
            request.Status = RequestStatus.InProgress;
            request.LastUpdateAt = DateTime.Now;

            var notification = new Notification
            {
                UserId = request.ActionBy ?? 0,
                Message = $"Vehicle {request.Vehicle.LicensePlate} has started being used for request #{requestId}",
                Type = "VehicleInUse",
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Notifications.Add(notification);

            await _dbContext.SaveChangesAsync();
            return Ok(request);
        }

        // Gửi thông báo tới Role
        private async Task SendNotificationToRole(UserRole role, string message, string type)
        {
            var users = await _dbContext.Users
                .Where(u => u.Role == role)
                .ToListAsync();

            var notifications = users.Select(user => new Notification
            {
                UserId = user.UserId,
                Message = message,
                Type = type,
            }).ToList();

            _dbContext.Notifications.AddRange(notifications);
        }

    }
}