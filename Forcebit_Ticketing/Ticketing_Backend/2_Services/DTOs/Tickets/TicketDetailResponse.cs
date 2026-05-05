using Services.DTOs.Attachments;
using Services.DTOs.Messages;

namespace Services.DTOs.Tickets
{
    public class TicketDetailResponse
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }

        public string ClientName { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? ClosedAt { get; set; }

        public List<TicketMessageResponse> Messages { get; set; } = new();
        public List<AttachmentResponse> Attachments { get; set; } = new();
    }
}
