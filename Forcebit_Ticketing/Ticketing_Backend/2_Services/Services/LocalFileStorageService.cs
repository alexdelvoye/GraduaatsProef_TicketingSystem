using Microsoft.Extensions.Options;
using Services.DTOs.Attachments;
using Services.Exceptions;
using Services.Interfaces;
using Services.Options;

namespace Services.Services
{
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly FileStorageOptions _options;
        private readonly string _uploadFolder;

        public LocalFileStorageService(IOptions<FileStorageOptions> options)
        {
            _options = options.Value;

            _uploadFolder = Path.Combine(
                Directory.GetCurrentDirectory(),
                _options.UploadFolder);

            if (!Directory.Exists(_uploadFolder))
            {
                Directory.CreateDirectory(_uploadFolder);
            }
        }

        public async Task<string> SaveFileAsync(FileUploadRequest file)
        {
            if (file.Length == 0)
                throw new BadRequestException("File is empty.");

            if (file.Length > _options.MaxFileSizeInBytes)
                throw new BadRequestException("File size exceeds the allowed limit.");

            var fileExtension = Path.GetExtension(file.FileName).ToLower();

            if (string.IsNullOrWhiteSpace(fileExtension))
                throw new BadRequestException("Invalid file type.");

            if (!_options.AllowedExtensions.Contains(fileExtension))
                throw new BadRequestException("File type not allowed.");

            var storedFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(_uploadFolder, storedFileName);

            using var fileStream = new FileStream(filePath, FileMode.Create);

            await file.Content.CopyToAsync(fileStream);

            return $"/{_options.UploadFolder}/{storedFileName}";
        }
    }
}