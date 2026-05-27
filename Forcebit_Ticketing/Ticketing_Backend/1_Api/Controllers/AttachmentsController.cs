using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Api.Mapping;

using Services.DTOs.Attachments;
using Services.Exceptions;
using Services.Interfaces;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/tickets/{ticketId:guid}/attachments")]
    // Attachment endpoints are protected because files belong to private ticket
    // conversations.
    [Authorize]
    public class AttachmentsController : ApiControllerBase
    {
        private readonly IAttachmentService _attachmentService;

        public AttachmentsController(IAttachmentService attachmentService)
        {
            _attachmentService = attachmentService;
        }

        [HttpPost]
        public async Task<ActionResult<AttachmentResponse>> UploadTicketAttachment(
            Guid ticketId,
            IFormFile? file)
        {
            if (file == null)
                throw new BadRequestException("A file is required.");

            // The uploader is the authenticated user, not a value submitted in
            // the multipart form.
            var userId = CurrentUserId;
            var role = CurrentUserRole;

            var fileRequest = FormFileMapper.ToFileUploadRequest(file);

            var attachment = await _attachmentService.UploadTicketAttachmentAsync(
                ticketId,
                userId,
                role,
                fileRequest);

            return Ok(attachment);
        }

        [HttpPost("messages/{messageId:guid}")]
        public async Task<ActionResult<AttachmentResponse>> UploadMessageAttachment(
            Guid ticketId,
            Guid messageId,
            IFormFile? file)
        {
            if (file == null)
                throw new BadRequestException("A file is required.");

            var userId = CurrentUserId;
            var role = CurrentUserRole;

            var fileRequest = FormFileMapper.ToFileUploadRequest(file);

            var attachment = await _attachmentService.UploadMessageAttachmentAsync(
                ticketId,
                messageId,
                userId,
                role,
                fileRequest);

            return Ok(attachment);
        }

        [HttpGet("{attachmentId:guid}/download")]
        public async Task<IActionResult> DownloadAttachment(
            Guid ticketId,
            Guid attachmentId)
        {
            // The service checks that the attachment belongs to this ticket and
            // that the authenticated user may access the ticket conversation.
            var download = await _attachmentService.DownloadAttachmentAsync(
                ticketId,
                attachmentId,
                CurrentUserId,
                CurrentUserRole);

            return File(download.Content, download.ContentType, download.FileName);
        }
    }
}
