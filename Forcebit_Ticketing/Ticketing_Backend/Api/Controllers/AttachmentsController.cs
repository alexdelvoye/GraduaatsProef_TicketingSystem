using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.DTOs.Attachments;
using Services.Interfaces;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/tickets/{ticketId:guid}/attachments")]
    [Authorize]
    public class AttachmentsController : ControllerBase
    {
        private readonly IAttachmentService _attachmentService;

        public AttachmentsController(IAttachmentService attachmentService)
        {
            _attachmentService = attachmentService;
        }

        [HttpPost]
        public async Task<ActionResult<AttachmentResponse>> UploadTicketAttachment(
            Guid ticketId,
            IFormFile file)
        {
            var userId = GetUserId();
            var role = GetUserRole();

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
            IFormFile file)
        {
            var userId = GetUserId();
            var role = GetUserRole();

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

        private Guid GetUserId()
        {
            return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        private string GetUserRole()
        {
            return User.FindFirstValue(ClaimTypes.Role)!;
        }
    }
}
