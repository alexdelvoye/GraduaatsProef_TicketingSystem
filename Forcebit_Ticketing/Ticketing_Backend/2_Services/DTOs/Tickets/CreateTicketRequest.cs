using System.ComponentModel.DataAnnotations;

namespace Services.DTOs.Tickets
{
    // Request DTO for creating a ticket. The text entered as the initial
    // description is stored as the first TicketMessage, not as a Ticket column.
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
        public string InitialMessage { get; set; } = string.Empty;
    }
}
