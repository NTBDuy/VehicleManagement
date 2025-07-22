using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace VMServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public HealthController(AppDbContext context)
        {
            _dbContext = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var canConnect = await _dbContext.Database.CanConnectAsync();
                if (!canConnect)
                {
                    return StatusCode(503, new { status = "fail", message = "Cannot connect to database" });
                }

                return Ok(new { status = "ok", message = "Service healthy" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = "error", message = ex.Message });
            }
        }
    }
}
