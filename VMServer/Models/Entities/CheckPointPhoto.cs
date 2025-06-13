using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VMServer.Models.Entities
{
    public class CheckPointPhoto
    {
        [Key]
        public int PhotoId { get; set; }

        [Required]
        [ForeignKey("CheckPoint")]
        public int CheckPointId { get; set; }

        public string Name { get; set; } = null!;
        
        public string FilePath { get; set; } = null!;
    }
}