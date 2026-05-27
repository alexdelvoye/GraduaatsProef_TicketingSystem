using Services.DTOs.Attachments;

namespace Services.Interfaces
{
    // Application-facing contract for attachment workflows. Controllers call
    // this instead of touching repositories or file storage directly.
    public interface IAttachmentService
    {
        // Uploads an attachment directly to the ticket, without linking it to a
        // specific message. The current UI mostly uses message attachments.
        Task<AttachmentResponse> UploadTicketAttachmentAsync(
            Guid ticketId,
            Guid uploadedById,
            string userRole,
            FileUploadRequest file);

        // Uploads a file that belongs to one conversation message.
        Task<AttachmentResponse> UploadMessageAttachmentAsync(
            Guid ticketId,
            Guid messageId,
            Guid uploadedById,
            string userRole,
            FileUploadRequest file);

        // Returns a readable stream only after checking ticket ownership/admin
        // access. The API layer turns this result into an HTTP file response.
        Task<AttachmentDownloadResponse> DownloadAttachmentAsync(
            Guid ticketId,
            Guid attachmentId,
            Guid userId,
            string userRole);
    }
}
