using VMServer.Models.Entities;

namespace VMServer.Models.DTOs
{
    public class DriverDTO
    {
        public string FullName { get; set; } = null!;

        public string PhoneNumber { get; set; } = null!;

        public string LicenseNumber { get; set; } = null!;

        public DateTime LicenseIssuedDate { get; set; }

        public int YearsOfExperience { get; set; }
    }
}