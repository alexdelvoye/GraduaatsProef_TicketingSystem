namespace Services.DTOs.Attachments
{
    // Service-layer result for a protected file download. The API controller
    // turns this into a FileStreamResult, while the service owns permission and
    // file-location checks.
    public class AttachmentDownloadResponse
    {
        public Stream Content { get; set; } = Stream.Null;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = "application/octet-stream";
    }
}
