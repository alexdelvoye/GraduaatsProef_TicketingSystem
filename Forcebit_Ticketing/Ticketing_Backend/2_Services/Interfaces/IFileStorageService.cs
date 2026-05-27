using Services.DTOs.Attachments;

namespace Services.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> SaveFileAsync(FileUploadRequest file);

        // Used when account/ticket data is removed, so database cleanup does
        // not leave orphaned files in the upload folder.
        Task DeleteFileIfExistsAsync(string storedFilePath);
    }
}
