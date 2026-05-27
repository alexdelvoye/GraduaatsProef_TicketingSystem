using System.ComponentModel.DataAnnotations;

namespace Api.Requests;

// API request shape for multipart replies. It exists separately from the
// service DTO so ASP.NET form-data binding stays in the API layer.
public class CreateMessageWithAttachmentsFormRequest
{
    // This is an API binding model, not the service DTO. The controller maps it
    // to CreateTicketMessageRequest before calling TicketService.
    [Required(ErrorMessage = "Reply is required.")]
    [StringLength(3000, ErrorMessage = "Reply must be 3000 characters or less.")]
    public string Message { get; set; } = string.Empty;
}
