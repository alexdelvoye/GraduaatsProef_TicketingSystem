
using Domain.Entities;
using Services.DTOs.Attachments;
using Services.Interfaces;

namespace Services.Services
{
    public class AttachmentService : IAttachmentService
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly IFileStorageService _fileStorageService;

        public AttachmentService(
            ITicketRepository ticketRepository,
            IAttachmentRepository attachmentRepository,
            IFileStorageService fileStorageService)
        {
            _ticketRepository = ticketRepository;
            _attachmentRepository = attachmentRepository;
            _fileStorageService = fileStorageService;
        }

        public async Task<AttachmentResponse> UploadTicketAttachmentAsync(
            Guid ticketId,
            Guid uploadedById,
            string userRole,
            FileUploadRequest file)
        {
            var ticket = await _ticketRepository.GetDetailByIdAsync(ticketId);

            if (ticket == null)
                throw new Exception("Ticket not found.");

            if (userRole == "Client" && ticket.ClientId != uploadedById)
                throw new Exception("You are not allowed to upload to this ticket.");

            var filePath = await _fileStorageService.SaveFileAsync(file);

            var attachment = new TicketAttachment
            {
                Id = Guid.NewGuid(),
                TicketId = ticketId,
                MessageId = null,
                UploadedById = uploadedById,
                FileName = file.FileName,
                FilePath = filePath,
                ContentType = file.ContentType,
                UploadedAt = DateTime.UtcNow
            };

            await _attachmentRepository.AddAsync(attachment);
            await _attachmentRepository.SaveChangesAsync();

            return MapToResponse(attachment);
        }

        public async Task<AttachmentResponse> UploadMessageAttachmentAsync(
            Guid ticketId,
            Guid messageId,
            Guid uploadedById,
            string userRole,
            FileUploadRequest file)
        {
            var ticket = await _ticketRepository.GetDetailByIdAsync(ticketId);

            if (ticket == null)
                throw new Exception("Ticket not found.");

            if (userRole == "Client" && ticket.ClientId != uploadedById)
                throw new Exception("You are not allowed to upload to this ticket.");

            var messageExists = ticket.Messages.Any(m => m.Id == messageId);

            if (!messageExists)
                throw new Exception("Message not found on this ticket.");

            var filePath = await _fileStorageService.SaveFileAsync(file);

            var attachment = new TicketAttachment
            {
                Id = Guid.NewGuid(),
                TicketId = ticketId,
                MessageId = null,
                UploadedById = uploadedById,
                FileName = file.FileName,
                FilePath = filePath,
                ContentType = file.ContentType,
                UploadedAt = DateTime.UtcNow
            };

            await _attachmentRepository.AddAsync(attachment);
            await _attachmentRepository.SaveChangesAsync();

            return MapToResponse(attachment);
        }

        private static AttachmentResponse MapToResponse(TicketAttachment attachment)
        {
            return new AttachmentResponse
            {
                Id = attachment.Id,
                TicketId = attachment.TicketId,
                MessageId = attachment.MessageId,
                FileName = attachment.FileName,
                FileUrl = attachment.FilePath,
                ContentType = attachment.ContentType,
                UploadedAt = attachment.UploadedAt
            };
        }
    }
}
