
namespace Services.Options
{
    public class FileStorageOptions
    {
        public string UploadFolder { get; set; } = "uploads";
        public long MaxFileSizeInBytes { get; set; } = 5 * 1024 * 1024;
        public string[] AllowedExtensions { get; set; } = [".jpg", ".jpeg", ".png", ".pdf"];
    }
}
