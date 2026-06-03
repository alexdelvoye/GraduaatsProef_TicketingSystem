using Services.DTOs.Attachments;

namespace Services.Interfaces
{
    // Contract for physical file storage. AttachmentService handles permission
    // checks and metadata; this service only knows how to save/open/delete files.
    public interface IFileStorageService
    {
        // Returns the stored relative path that is saved in TicketAttachment.
        Task<string> SaveFileAsync(FileUploadRequest file);

        // Opens an already stored file for protected downloads. Permission
        // checks happen in AttachmentService before this method is called.
        Task<Stream> OpenReadAsync(string storedFilePath);

        // Used when account/ticket data is removed, so database cleanup does
        // not leave orphaned files in the upload folder.
        Task DeleteFileIfExistsAsync(string storedFilePath);
    }
}
