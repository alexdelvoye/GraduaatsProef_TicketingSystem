using System.ComponentModel.DataAnnotations;

namespace Api.Requests;

// API request shape for multipart ticket creation. This stays in the API layer
// because it describes how form-data arrives over HTTP, while CreateTicketRequest
// remains the service-layer DTO used by the ticket use case.
public class CreateTicketWithAttachmentsFormRequest
{
    // These properties match the multipart form field names sent by the
    // frontend. They intentionally do not include files; files are read from
    // Request.Form.Files because that is more reliable across Expo platforms.
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    [Required]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [StringLength(3000, ErrorMessage = "Description must be 3000 characters or less.")]
    public string InitialMessage { get; set; } = string.Empty;
}
