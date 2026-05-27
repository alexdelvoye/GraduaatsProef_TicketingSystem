using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

            // Convert ASP.NET's IFormFile into a service DTO. This keeps the
            // service layer independent from ASP.NET-specific types.
            var fileRequest = new FileUploadRequest
            {
                FileName = file.FileName,
                ContentType = file.ContentType,
                Content = file.OpenReadStream(),
                Length = file.Length
            };

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

            // Message attachments use the same uploaded file shape, plus the
            // message id from the nested route.
            var fileRequest = new FileUploadRequest
            {
                FileName = file.FileName,
                ContentType = file.ContentType,
                Content = file.OpenReadStream(),
                Length = file.Length
            };

            var attachment = await _attachmentService.UploadMessageAttachmentAsync(
                ticketId,
                messageId,
                userId,
                role,
                fileRequest);

            return Ok(attachment);
        }
    }
}
