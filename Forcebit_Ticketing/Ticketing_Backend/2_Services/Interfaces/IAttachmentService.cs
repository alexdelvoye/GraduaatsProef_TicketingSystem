using Services.DTOs.Attachments;

namespace Services.Interfaces
{
    public interface IAttachmentService
    {
        Task<AttachmentResponse> UploadTicketAttachmentAsync(
            Guid ticketId,
            Guid uploadedById,
            string userRole,
            FileUploadRequest file);

        Task<AttachmentResponse> UploadMessageAttachmentAsync(
            Guid ticketId,
            Guid messageId,
            Guid uploadedById,
            string userRole,
            FileUploadRequest file);
    }
}
