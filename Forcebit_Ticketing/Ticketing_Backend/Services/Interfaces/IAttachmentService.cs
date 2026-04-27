using Microsoft.AspNetCore.Http;
using Services.DTOs.Attachments;

namespace Services.Interfaces
{
    public interface IAttachmentService
    {
        Task<AttachmentResponse> UploadTicketAttachmentAsync(
            Guid ticketId,
            Guid uploadedById,
            string userRole,
            IFormFile file);

        Task<AttachmentResponse> UploadMessageAttachmentAsync(
            Guid ticketId,
            Guid messageId,
            Guid uploadedById,
            string userRole,
            IFormFile file);
    }
}
