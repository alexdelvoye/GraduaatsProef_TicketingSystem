namespace Services.DTOs.Attachments
{
    // Service-layer representation of an uploaded file.
    // Controllers convert IFormFile into this DTO so services do not depend on
    // ASP.NET Core types.
    public class FileUploadRequest
    {
        public string FileName { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public Stream Content { get; set; } = Stream.Null;

        public long Length { get; set; }
    }
}
