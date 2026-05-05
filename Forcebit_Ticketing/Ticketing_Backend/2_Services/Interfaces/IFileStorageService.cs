using Services.DTOs.Attachments;

namespace Services.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> SaveFileAsync(FileUploadRequest file);
    }
}
