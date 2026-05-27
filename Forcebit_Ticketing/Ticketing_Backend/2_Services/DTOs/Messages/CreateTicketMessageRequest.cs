using System.ComponentModel.DataAnnotations;

namespace Services.DTOs.Messages
{
    // Request body for adding a reply to an existing ticket.
    // The authenticated user is taken from the JWT, so the frontend only sends
    // the message text and never chooses the sender id.
    public class CreateTicketMessageRequest
    {
        // This length matches Persistence/Configurations/TicketMessageConfiguration.
        // Keeping the API limit equal to the database limit prevents a long
        // message from passing validation and then crashing during SaveChanges.
        [Required]
        [StringLength(3000, ErrorMessage = "Reply must be 3000 characters or less.")]
        public string Message { get; set; } = string.Empty;
    }
}
