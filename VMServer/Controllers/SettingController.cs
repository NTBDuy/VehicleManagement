using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VMServer.Models.DTOs;
using VMServer.Models.Entities;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;


namespace VMServer.Controllers
{
    [Route("api/setting")]
    [ApiController]
    public class SettingController : ControllerBase
    {
        private readonly AppDbContext _dbContext;


        public SettingController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/setting
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _dbContext.AppSettings.ToListAsync();
            return Ok(settings);
        }

        // GET: api/setting/CHECK_IN_RADIUS
        // Trả về setting theo key
        [Authorize]
        [HttpGet("{key}")]
        public async Task<IActionResult> GetSetting(string key)
        {
            var setting = await _dbContext.AppSettings.FirstOrDefaultAsync(s => s.SettingKey == key);
            if (setting == null)
                return NotFound(new { message = $"Not found setting with {key}" });
            return Ok(setting);
        }

        // PUT: api/setting/CHECK_IN_RADIUS
        // Cập nhật setting
        [Authorize]
        [HttpPut("{key}")]
        public async Task<IActionResult> UpdateSetting(string key, [FromBody] UpdateSettingDTO dto)
        {
            var setting = await _dbContext.AppSettings.FirstOrDefaultAsync(s => s.SettingKey == key);
            if (setting == null)
                return NotFound(new { message = $"Not found setting with {key}" });

            setting.SettingValue = dto.SettingValue;
            setting.SettingType = dto.SettingType;
            setting.Description = dto.Description;
            setting.UpdatedAt = DateTime.Now;

            await _dbContext.SaveChangesAsync();
            return Ok(setting);

        }
    }
}