namespace VMServer.Models.DTOs
{
    public class CreateNewRequestDTO
    {
        public int UserId { get; set; }
        public int VehicleId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public required string Purpose { get; set; }
        public bool IsDriverRequired { get; set; }
        public List<RequestLocationDTO>? Locations { get; set; }
        public double EstimatedTotalDistance { get; set; }
    }
}
