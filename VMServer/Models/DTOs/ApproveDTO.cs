namespace VMServer.Models.DTOs
{
    public class ApproveDTO
    {
        public required int DriverId { get; set; }
        public string? Note { get; set; }
    }
}