
namespace VMServer.Models.DTOs
{
    public class CheckPointDTO
    {
        public required decimal Latitude { get; set; }
        public required decimal Longitude { get; set; }
        public required List<IFormFile> Photos { get; set; }
        public string? Note { get; set; }
        public required int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}