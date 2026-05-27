
using System.ComponentModel.DataAnnotations;

namespace Services.DTOs.Tickets
{
    public class CreateTicketRequest
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        [Required]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [StringLength(4000)]
        public string Description { get; set; } = string.Empty;
    }
}
