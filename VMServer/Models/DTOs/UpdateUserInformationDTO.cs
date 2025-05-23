namespace VMServer.Models.DTOs
{
    public class UpdateUserInformationDTO
    {
        public required string FullName { get; set; }

        public required string Email { get; set; }
        
        public required string PhoneNumber { get; set; }
    }
}