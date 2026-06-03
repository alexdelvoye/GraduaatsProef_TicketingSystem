using System.ComponentModel.DataAnnotations;

namespace Services.Options
{
    // Options class for local upload rules. Keeping these values in config makes
    // the upload policy easy to change without editing code.
    public class FileStorageOptions
    {
        // Relative folder under the API project where uploads are written.
        [Required]
        public string UploadFolder { get; set; } = "uploads";

        // The Range attribute is checked at startup because Program.cs calls
        // ValidateDataAnnotations() for this options class.
        // Brevo transactional emails allow 20 MB total email size including
        // attachments and content. The local upload limit follows that ceiling.
        // The frontend mirrors this value for user feedback, but this backend
        // option remains the real enforcement point.
        [Range(1, 20 * 1024 * 1024)]
        public long MaxFileSizeInBytes { get; set; } = 20 * 1024 * 1024;

        // Keep extensions lowercase because LocalFileStorageService normalizes
        // uploaded file extensions before comparing.
        [MinLength(1)]
        public string[] AllowedExtensions { get; set; } = [".jpg", ".jpeg", ".png", ".pdf", ".zip"];
    }
}
