namespace VMServer.Models.DTOs
{
    public class RequestLocationDTO
    {
        public required string Name { get; set; } = null!;

        public required string Address { get; set; } = null!;

        public string? Note { get; set; }

        public required decimal Latitude { get; set; }

        public required decimal Longitude { get; set; }

        public int Order { get; set; }
    }
}
