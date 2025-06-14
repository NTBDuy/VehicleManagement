namespace VMServer.Models.DTOs
{
    public class UpdateSettingDTO
    {
        public string SettingValue { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? SettingType { get; set; }
    }
}