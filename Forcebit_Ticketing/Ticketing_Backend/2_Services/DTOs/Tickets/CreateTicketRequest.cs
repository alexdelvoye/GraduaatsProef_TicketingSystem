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

        // The form calls this a description for the client, but the backend
        // stores it as the first TicketMessage. That is why this uses the same
        // 3000-character limit as a normal reply.
        [Required]
        [StringLength(3000, ErrorMessage = "Description must be 3000 characters or less.")]
        public string InitialMessage { get; set; } = string.Empty;
    }
}
