

namespace Services.DTOs.Attachments
{
    public class AttachmentResponse
    {
        public Guid Id { get; set; }
        public Guid TicketId { get; set; }
        public Guid? MessageId { get; set; }

        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; }

        public FileUploadRequest File { get; set; }
    }
}
