namespace Services.DTOs.Attachments
{
    // Public metadata returned after uploads and inside ticket detail messages.
    // The API exposes a protected download endpoint separately; FileUrl keeps
    // the saved storage path visible without making the upload folder public.
    public class AttachmentResponse
    {
        public Guid Id { get; set; }
        public Guid TicketId { get; set; }
        public Guid? MessageId { get; set; }

        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; }
    }
}
