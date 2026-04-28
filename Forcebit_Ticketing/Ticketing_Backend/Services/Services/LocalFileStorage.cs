using Services.DTOs.Attachments;
using Services.Interfaces;

namespace Services.Services
{
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly string _uploadFolder;

        public LocalFileStorageService()
        {
            _uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

            if (!Directory.Exists(_uploadFolder))
            {
                Directory.CreateDirectory(_uploadFolder);
            }
        }

        public async Task<string> SaveFileAsync(FileUploadRequest file)
        {
            var fileExtension = Path.GetExtension(file.FileName);
            var storedFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(_uploadFolder, storedFileName);

            using var fileStream = new FileStream(filePath, FileMode.Create);

            await file.Content.CopyToAsync(fileStream);

            return $"/uploads/{storedFileName}";
        }
    }
}
