using Domain.Entities;
using Domain.Enums;
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

            var role = ParseRoleOrThrow(userRole);

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

            var role = ParseRoleOrThrow(userRole);

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

        public async Task<AttachmentDownloadResponse> DownloadAttachmentAsync(
            Guid ticketId,
            Guid attachmentId,
            Guid userId,
            string userRole)
        {
            // The attachment id comes from the URL, but the ticket id is also
            // checked so a user cannot download a file through the wrong ticket.
            var attachment = await _attachmentRepository.GetByIdAsync(attachmentId);

            if (attachment == null || attachment.TicketId != ticketId)
                throw new NotFoundException("Attachment not found.");

            var ticket = await _ticketRepository.GetByIdAsync(ticketId);

            if (ticket == null)
                throw new NotFoundException("Ticket not found.");

            var role = ParseRoleOrThrow(userRole);

            if (!TicketRules.CanAccess(ticket, userId, role))
                throw new ForbiddenException("You are not allowed to download this attachment.");

            var content = await _fileStorageService.OpenReadAsync(attachment.FilePath);

            _logger.LogInformation(
                "Attachment {AttachmentId} downloaded from ticket {TicketId} by user {UserId}.",
                attachmentId,
                ticketId,
                userId);

            return new AttachmentDownloadResponse
            {
                Content = content,
                FileName = attachment.FileName,
                ContentType = string.IsNullOrWhiteSpace(attachment.ContentType)
                    ? "application/octet-stream"
                    : attachment.ContentType
            };
        }

        private static UserRole ParseRoleOrThrow(string userRole)
        {
            // Roles arrive from JWT claims as strings. Converting once here
            // keeps the public methods focused on their upload/download flow.
            if (UserRoleRules.TryParse(userRole, out var role))
                return role;

            throw new ForbiddenException("Invalid user role.");
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
