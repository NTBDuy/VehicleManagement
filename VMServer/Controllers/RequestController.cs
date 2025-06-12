using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VMServer.Models.DTOs;
using VMServer.Models.Entities;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text;

namespace VMServer.Controllers
{
    [Route("api/request")]
    [ApiController]
    public class RequestController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        public readonly IWebHostEnvironment _environment;
        private readonly string _apiKey;

        public RequestController(AppDbContext dbContext, IWebHostEnvironment environment, IConfiguration configuration)
        {
            _dbContext = dbContext;
            _environment = environment;
            _apiKey = configuration["OpenRouteService:ApiKey"]
                ?? throw new InvalidOperationException("Missing OpenRouteService API key in configuration.");
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
                .Include(r => r.Locations)
                .OrderByDescending(r => r.LastUpdateAt)
                .ToListAsync();
            return Ok(requests);
        }

        // GET: api/request/{requestId}
        // Lấy yêu cầu chi tiết
        [Authorize]
        [HttpGet("{requestId}")]
        public async Task<IActionResult> GetRequestDetails(int requestId)
        {
            var request = await _dbContext.Requests
               .Include(r => r.User)
               .Include(r => r.Vehicle)
               .Include(r => r.ActionByUser)
                .Include(r => r.Locations)
               .FirstOrDefaultAsync(r => r.RequestId == requestId);

            if (request == null)
                return NotFound(new { message = $"Request not found with ID #{requestId}" });

            return Ok(request);
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
            if (dto == null || dto.Locations == null)
                return BadRequest(new { message = "No data provided. Please check again!" });

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
                StartLocation = dto.StartLocation,
                EndLocation = dto.EndLocation,
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

            foreach (var location in dto.Locations)
            {
                var newRequestLocation = new RequestLocation
                {
                    RequestId = newRequest.RequestId,
                    Name = location.Name,
                    Address = location.Address,
                    Note = location.Note,
                    Latitude = location.Latitude,
                    Longitude = location.Longitude,
                    Order = location.Order
                };

                _dbContext.RequestLocations.Add(newRequestLocation);
            }
            await _dbContext.SaveChangesAsync();
            return Ok(newRequest);
        }

        // GET: api/request/{requestId}/check-point
        // Lấy danh sách check point
        [Authorize]
        [HttpGet("{requestId}/check-point")]
        public async Task<IActionResult> CheckPointList(int requestId)
        {
            var request = await _dbContext.Requests.FindAsync(requestId);

            if (request == null)
                return NotFound(new { message = $"Request not found with ID #{requestId}" });

            var checkPoints = await _dbContext.CheckPoints
                .Where(c => c.RequestId == requestId)
                .Include(c => c.Photos)
                .ToListAsync();

            return Ok(checkPoints);
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
                .Include(r => r.Locations)
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
                .Include(r => r.Locations)
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
                .Include(r => r.Locations)
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
                .Include(r => r.Locations)
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

        // POST: api/request/{requestId}/check-point
        // Lưu check point
        [Authorize]
        [HttpPost("{requestId}/check-point")]
        public async Task<IActionResult> CheckPoint(int requestId, [FromForm] CheckPointDTO dto)
        {
            var request = await _dbContext.Requests.FindAsync(requestId);

            if (request == null)
                return NotFound(new { message = $"Request not found with ID #{requestId}" });

            var isCheckIn = dto.Type == CheckPointType.CheckIn;
            var folderPath = Path.Combine("uploads", isCheckIn ? "CheckIn" : "CheckOut", DateTime.Now.ToString("yyyy"), DateTime.Now.ToString("MM"));
            Directory.CreateDirectory(folderPath);

            var newCheckPoint = new CheckPoint
            {
                RequestId = requestId,
                Type = dto.Type,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Note = dto.Note,
                CreatedBy = dto.CreatedBy,
            };

            _dbContext.CheckPoints.Add(newCheckPoint);
            await _dbContext.SaveChangesAsync();

            foreach (var photo in dto.Photos)
            {
                var fileName = $"{(isCheckIn ? "CheckIn" : "CheckOut")}_{request.RequestId}_{DateTime.Now:yyyyMMdd_HHmmssfff}_{Guid.NewGuid().ToString().Substring(0, 6)}.jpg";
                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await photo.CopyToAsync(stream);
                }

                var newCheckPointPhoto = new CheckPointPhoto
                {
                    CheckPointId = newCheckPoint.CheckPointId,
                    FilePath = filePath,
                    Name = fileName
                };

                _dbContext.CheckPointPhotos.Add(newCheckPointPhoto);
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Upload thành công" });
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
                .Include(r => r.Locations)
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

            var locations = await _dbContext.CheckPoints
                .Where(c => c.RequestId == requestId)
                .OrderBy(c => c.CheckPointId)
                .Select(c => new { c.Latitude, c.Longitude })
                .ToListAsync();

            double totalDistance = 0.0;

            for (int i = 1; i < locations.Count; i++)
            {
                totalDistance += await GetDistanceFromApiAsync(
                    (double)locations[i - 1].Latitude, (double)locations[i - 1].Longitude,
                    (double)locations[i].Latitude, (double)locations[i].Longitude);
            }

            request.TotalDistance = totalDistance;
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

        [HttpGet("{requestId}/test-calculate-distance")]
        public async Task<IActionResult> CalculateDistance(int requestId)
        {
            var request = await _dbContext.Requests.FindAsync(requestId);
            if (request == null)
                return NotFound(new { message = $"Request not found with ID #{requestId}" });

            var locations = await _dbContext.CheckPoints
                .Where(c => c.RequestId == requestId)
                .OrderBy(c => c.CheckPointId)
                .Select(c => new { c.Latitude, c.Longitude })
                .ToListAsync();

            double totalDistance = 0.0;

            for (int i = 1; i < locations.Count; i++)
            {
                totalDistance += await GetDistanceFromApiAsync(
                    (double)locations[i - 1].Latitude, (double)locations[i - 1].Longitude,
                    (double)locations[i].Latitude, (double)locations[i].Longitude);
            }

            return Ok(new { TotalDistanceInKm = totalDistance, Points = locations });
        }

        private async Task<double> GetDistanceFromApiAsync(double lat1, double lon1, double lat2, double lon2)
        {
            using var client = new HttpClient();

            var requestBody = new
            {
                locations = new List<List<double>>
                {
                    new List<double> { lon1, lat1 },
                    new List<double> { lon2, lat2 }
                },
                metrics = new[] { "distance" },
                units = "km"
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            client.DefaultRequestHeaders.Add("Authorization", _apiKey);

            var response = await client.PostAsync("https://api.openrouteservice.org/v2/matrix/driving-car", content);
            response.EnsureSuccessStatusCode();

            string responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<DistanceMatrixResponse>(responseContent);

            return result?.distances?[0]?[1] ?? -1;
        }

        // GET: api/request/file/{filename}
        // Lấy hình ảnh
        [HttpGet("files/{fileName}")]
        public IActionResult GetFile(string fileName)
        {
            string[] parts = fileName.Split('_');
            string datePart = parts[2];

            string type = parts[0];
            string year = datePart.Substring(0, 4);
            string month = datePart.Substring(4, 2);

            var filePath = Path.Combine("uploads", type, year, month, fileName);
            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            return File(fileBytes, "image/jpeg");
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