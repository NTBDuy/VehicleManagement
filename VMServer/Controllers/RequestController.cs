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
                return Unauthorized(new { message = "You are not authorized to start this request." });

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
                CreatedAt = DateTime.Now
            };

            _dbContext.Notifications.Add(notification);

            await _dbContext.SaveChangesAsync();
            return Ok(request);
        }

        // PUT: api/request/{requestId}/end-usage
        // kết thúc sử dụng phương tiện
        [Authorize]
        [HttpPut("{requestId}/end-usage")]
        public async Task<IActionResult> EndUsageVehicle(int requestId)
        {
            var request = await _dbContext.Requests
               .Include(r => r.User)
               .Include(r => r.Vehicle)
               .Include(r => r.ActionByUser)
               .FirstOrDefaultAsync(r => r.RequestId == requestId);

            if (request == null)
                return NotFound(new { message = $"Request not found with ID #{requestId}" });

            if (request.Status != RequestStatus.InProgress)
                return BadRequest(new { message = "Request must be in progress before usage can be ended." });

            var claimUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(claimUserId, out var userId))
                return Forbid("Invalid user identity.");

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return Unauthorized(new { message = "Invalid user identity." });

            if (userId != request.UserId && user.Role != UserRole.Manager)
                return Unauthorized(new { message = "You are not authorized to end this request." });

            if (request.Vehicle == null)
                return BadRequest(new { message = "Vehicle not found" });

            if (DateTime.Now > request.EndTime)
            {
                var overdueNotification = new Notification
                {
                    UserId = request.UserId,
                    Message = $"Vehicle {request.Vehicle.LicensePlate} was returned late for request #{requestId}",
                    Type = "OverdueReturn",
                    CreatedAt = DateTime.Now
                };
                _dbContext.Notifications.Add(overdueNotification);
            }

            request.Vehicle.Status = Status.Available;
            request.Status = RequestStatus.Done;
            request.LastUpdateAt = DateTime.Now;

            if (request.ActionBy.HasValue)
            {
                var notification = new Notification
                {
                    UserId = request.ActionBy.Value,
                    Message = $"Vehicle {request.Vehicle.LicensePlate} has done for request #{requestId}",
                    Type = "VehicleReturned",
                    CreatedAt = DateTime.Now
                };
                _dbContext.Notifications.Add(notification);
            }


            if (user.Role == UserRole.Manager && userId != request.UserId)
            {
                var userNotification = new Notification
                {
                    UserId = request.UserId,
                    Message = $"Your vehicle request #{requestId} has been completed by manager",
                    Type = "RequestCompleted",
                    CreatedAt = DateTime.Now
                };
                _dbContext.Notifications.Add(userNotification);
            }

            await _dbContext.SaveChangesAsync();
            return Ok(request);
        }

        // PUT: api/request/{requestId}/remind-return
        // Nhắc nhở kết thúc sử dụng phương tiện
        [Authorize(Roles = "Manager")]
        [HttpPut("{requestId}/remind-return")]
        public async Task<IActionResult> RemindReturnVehicle(int requestId)
        {
            var request = await _dbContext.Requests
               .Include(r => r.User)
               .Include(r => r.Vehicle)
               .Include(r => r.ActionByUser)
               .FirstOrDefaultAsync(r => r.RequestId == requestId);

            if (request == null)
                return NotFound(new { message = $"Request not found with ID #{requestId}" });

            if (request.Status != RequestStatus.InProgress)
                return BadRequest(new { message = "Request must be in progress to send reminder." });

            var today = DateTime.Now.Date;
            var dueDate = request.EndTime.Date;
            var isOverdue = today > dueDate;
            var isDueToday = today == dueDate;
            var isDueTomorrow = today.AddDays(1) == dueDate;

            Notification notification;

            if (isOverdue)
            {
                notification = new Notification
                {
                    UserId = request.UserId,
                    Message = $"URGENT: Vehicle {request.Vehicle?.LicensePlate} return is overdue for request #{requestId}. Please return immediately.",
                    Type = "RemindReturn",
                    CreatedAt = DateTime.Now
                };
            }
            else if (isDueToday)
            {
                notification = new Notification
                {
                    UserId = request.UserId,
                    Message = $"REMINDER: Vehicle {request.Vehicle?.LicensePlate} must be returned today for request #{requestId}.",
                    Type = "RemindReturn",
                    CreatedAt = DateTime.Now
                };
            }
            else if (isDueTomorrow)
            {
                notification = new Notification
                {
                    UserId = request.UserId,
                    Message = $"REMINDER: Vehicle {request.Vehicle?.LicensePlate} must be returned tomorrow for request #{requestId}.",
                    Type = "RemindReturn",
                    CreatedAt = DateTime.Now
                };
            }
            else
            {
                notification = new Notification
                {
                    UserId = request.UserId,
                    Message = $"REMINDER: Please prepare to return vehicle {request.Vehicle?.LicensePlate} by {request.EndTime:dd/MM/yyyy} for request #{requestId}.",
                    Type = "RemindReturn",
                    CreatedAt = DateTime.Now
                };
            }

            var existingReminder = await _dbContext.Notifications
                .Where(n => n.UserId == request.UserId &&
                           n.Type.Contains("Return") &&
                           n.Message.Contains($"#{requestId}") &&
                           n.CreatedAt.Date == DateTime.Now.Date)
                .FirstOrDefaultAsync();

            if (existingReminder != null)
                return BadRequest(new { message = "Reminder has already been sent today for this request." });

            _dbContext.Notifications.Add(notification);

            var managerNotification = new Notification
            {
                UserId = request.ActionBy ?? 0,
                Message = $"Reminder sent to {request.User?.FullName} for vehicle return (Request #{requestId})",
                Type = "ReminderSent",
                CreatedAt = DateTime.Now
            };
            _dbContext.Notifications.Add(managerNotification);

            request.LastUpdateAt = DateTime.Now;

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                message = "Reminder sent successfully",
            });
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