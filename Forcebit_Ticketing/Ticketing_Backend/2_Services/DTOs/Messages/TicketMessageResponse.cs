using Services.DTOs.Attachments;

namespace Services.DTOs.Messages
{
    public class TicketMessageResponse
    {
        public Guid Id { get; set; }
        public Guid TicketId { get; set; }
        public Guid SenderId { get; set; }

        public string SenderName { get; set; } = string.Empty;
        public string SenderRole { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public List<AttachmentResponse> Attachments { get; set; } = new();
    }
}
