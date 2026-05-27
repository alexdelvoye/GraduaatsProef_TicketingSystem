using Domain.Entities;
using Domain.Rules;

using Microsoft.Extensions.Logging;

using Services.DTOs.Attachments;
using Services.Exceptions;
using Services.Interfaces;

namespace Services.Services
{
    // Application service for attachment use cases.
    // It checks ticket access rules, delegates physical file saving to
    // IFileStorageService, then stores attachment metadata through a repository.
    public class AttachmentService : IAttachmentService
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly IFileStorageService _fileStorageService;
        private readonly ILogger<AttachmentService> _logger;

        public AttachmentService(
            ITicketRepository ticketRepository,
            IAttachmentRepository attachmentRepository,
            IFileStorageService fileStorageService,
            ILogger<AttachmentService> logger)
        {
            _ticketRepository = ticketRepository;
            _attachmentRepository = attachmentRepository;
            _fileStorageService = fileStorageService;
            _logger = logger;
        }

        public async Task<AttachmentResponse> UploadTicketAttachmentAsync(
            Guid ticketId,
            Guid uploadedById,
            string userRole,
            FileUploadRequest file)
        {
            // Load the ticket with related data first so access rules can be
            // checked against the real ticket owner.
            var ticket = await _ticketRepository.GetDetailByIdAsync(ticketId);

            if (ticket == null)
                throw new NotFoundException("Ticket not found.");

            // Convert the role claim string to a domain enum before applying
            // rules. Invalid role claims are treated as forbidden.
            if (!UserRoleRules.TryParse(userRole, out var role))
                throw new ForbiddenException("Invalid user role.");

            // The same ownership/admin rule applies to uploads as to reading a ticket.
            if (!TicketRules.CanUploadAttachment(ticket, uploadedById, role))
                throw new ForbiddenException("You are not allowed to upload to this ticket.");

            // Physical file writing is isolated behind IFileStorageService so
            // this service only coordinates the upload workflow.
            var filePath = await _fileStorageService.SaveFileAsync(file);

            // The database stores metadata and the file path; it does not store
            // the binary file itself.
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

            _logger.LogInformation(
                "Attachment {AttachmentId} uploaded to ticket {TicketId} by user {UploadedById}.",
                attachment.Id,
                ticketId,
                uploadedById);

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
                throw new NotFoundException("Ticket not found.");

            if (!UserRoleRules.TryParse(userRole, out var role))
                throw new ForbiddenException("Invalid user role.");

            if (!TicketRules.CanUploadAttachment(ticket, uploadedById, role))
                throw new ForbiddenException("You are not allowed to upload to this ticket.");

            // A message attachment must belong to a message on the same ticket.
            // This avoids attaching a file to a random message id.
            var messageExists = ticket.Messages.Any(m => m.Id == messageId);

            if (!messageExists)
                throw new NotFoundException("Message not found on this ticket.");

            var filePath = await _fileStorageService.SaveFileAsync(file);

            var attachment = new TicketAttachment
            {
                Id = Guid.NewGuid(),
                TicketId = ticketId,
                MessageId = messageId,
                UploadedById = uploadedById,
                FileName = file.FileName,
                FilePath = filePath,
                ContentType = file.ContentType,
                UploadedAt = DateTime.UtcNow
            };

            await _attachmentRepository.AddAsync(attachment);
            await _attachmentRepository.SaveChangesAsync();

            _logger.LogInformation(
                "Attachment {AttachmentId} uploaded to message {MessageId} on ticket {TicketId} by user {UploadedById}.",
                attachment.Id,
                messageId,
                ticketId,
                uploadedById);

            return MapToResponse(attachment);
        }

        private static AttachmentResponse MapToResponse(TicketAttachment attachment)
        {
            // DTO mapping keeps the public API response small and stable.
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
