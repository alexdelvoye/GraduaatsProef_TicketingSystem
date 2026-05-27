using Microsoft.Extensions.Options;
using Services.DTOs.Attachments;
using Services.Exceptions;
using Services.Interfaces;
using Services.Options;

namespace Services.Services
{
    // Infrastructure-style service that stores uploaded files on disk.
    // The options pattern controls folder, max size and allowed extensions from
    // configuration instead of hard-coding them in the service.
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
                throw new BadRequestException(
                    $"File size exceeds the allowed limit of {FormatBytes(_options.MaxFileSizeInBytes)}.");

            var fileExtension = Path.GetExtension(file.FileName).ToLower();

            if (string.IsNullOrWhiteSpace(fileExtension))
                throw new BadRequestException("Invalid file type.");

            if (!_options.AllowedExtensions.Contains(fileExtension))
                throw new BadRequestException("File type not allowed.");

            var storedFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(_uploadFolder, storedFileName);

            if (file.Content.CanSeek)
            {
                file.Content.Position = 0;
            }

            using var fileStream = new FileStream(filePath, FileMode.Create);

            await file.Content.CopyToAsync(fileStream);

            if (file.Content.CanSeek)
            {
                file.Content.Position = 0;
            }

            return $"/{_options.UploadFolder}/{storedFileName}";
        }

        public Task<Stream> OpenReadAsync(string storedFilePath)
        {
            // Downloading uses the same path resolver as deletion. That keeps
            // all local-file safety checks in one place instead of duplicating
            // path logic in services/controllers.
            var absolutePath = ResolveStoredFilePath(storedFilePath);

            if (!File.Exists(absolutePath))
                throw new NotFoundException("Attachment file not found on the server.");

            return Task.FromResult<Stream>(File.OpenRead(absolutePath));
        }

        public Task DeleteFileIfExistsAsync(string storedFilePath)
        {
            if (string.IsNullOrWhiteSpace(storedFilePath))
                return Task.CompletedTask;

            // Missing files are not fatal during cleanup. The database row may
            // still need to be deleted even if the local file was already gone.
            var absolutePath = ResolveStoredFilePath(storedFilePath);

            if (File.Exists(absolutePath))
            {
                File.Delete(absolutePath);
            }

            return Task.CompletedTask;
        }

        private string ResolveStoredFilePath(string storedFilePath)
        {
            if (string.IsNullOrWhiteSpace(storedFilePath))
                throw new NotFoundException("Attachment file not found on the server.");

            // Stored paths look like "/uploads/file.pdf". Convert only the file
            // name back to a physical path. That prevents a crafted database
            // value such as "../secret.txt" from escaping the upload folder.
            var fileName = Path.GetFileName(storedFilePath);
            var absolutePath = Path.GetFullPath(Path.Combine(_uploadFolder, fileName));
            var uploadRoot = Path.GetFullPath(_uploadFolder);

            if (!absolutePath.StartsWith(uploadRoot, StringComparison.OrdinalIgnoreCase))
                throw new ForbiddenException("Invalid attachment path.");

            return absolutePath;
        }

        private static string FormatBytes(long bytes)
        {
            // Keep the error message readable for users instead of returning a
            // raw byte count such as 20971520.
            return $"{bytes / 1024 / 1024} MB";
        }
    }
}
