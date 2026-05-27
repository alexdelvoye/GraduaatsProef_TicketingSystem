namespace Services.DTOs.Attachments
{
    // Lightweight DTO used only when sending files to Brevo.
    // The database stores metadata separately in TicketAttachment; this DTO is
    // the in-memory file content needed for the email API.
    public class EmailAttachmentRequest
    {
        public string FileName { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public byte[] Content { get; set; } = [];
    }
}
