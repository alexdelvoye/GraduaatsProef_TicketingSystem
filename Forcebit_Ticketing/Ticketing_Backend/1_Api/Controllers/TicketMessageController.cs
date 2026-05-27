using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Services.DTOs.Attachments;
using Services.DTOs.Messages;
using Services.Exceptions;
using Services.Interfaces;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/tickets/{ticketId:guid}/messages")]
    // Message routes are nested under a ticket because a message has no meaning
    // without its parent ticket.
    [Authorize]
    public class TicketMessagesController : ApiControllerBase
    {
        private readonly ITicketService _ticketService;

        public TicketMessagesController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }

        [HttpPost]
        public async Task<ActionResult<TicketMessageResponse>> AddMessage(
            Guid ticketId,
            CreateTicketMessageRequest request)
        {
            // The authenticated user is the sender. This avoids trusting a
            // sender id from the frontend.
            var userId = CurrentUserId;
            var role = CurrentUserRole;

            var message = await _ticketService.AddMessageAsync(ticketId, userId, role, request);

            return Ok(message);
        }

        [HttpPost("with-attachments")]
        public async Task<ActionResult<TicketMessageResponse>> AddMessageWithAttachments(
            Guid ticketId,
            [FromForm] string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                throw new BadRequestException("Reply is required.");

            if (message.Length > 3000)
                throw new BadRequestException("Reply must be 3000 characters or less.");

            // Multipart/form-data is used when the reply contains files. The
            // service still receives the same message DTO and file abstraction,
            // so validation/business rules remain in the service layer.
            var request = new CreateTicketMessageRequest
            {
                Message = message
            };

            // React Native, Expo Web and browser clients can encode multipart
            // uploads slightly differently. Reading Request.Form.Files directly
            // avoids depending on one exact model-binding shape for the file
            // field, while still requiring the frontend to send files.
            var uploadedFiles = Request.Form.Files;

            if (uploadedFiles.Count == 0)
                throw new BadRequestException("At least one attachment is required.");

            var fileRequests = uploadedFiles
                .Select(file => new FileUploadRequest
                {
                    FileName = file.FileName,
                    ContentType = file.ContentType,
                    Content = file.OpenReadStream(),
                    Length = file.Length
                })
                .ToList();

            var response = await _ticketService.AddMessageAsync(
                ticketId,
                CurrentUserId,
                CurrentUserRole,
                request,
                fileRequests);

            return Ok(response);
        }
    }
}
