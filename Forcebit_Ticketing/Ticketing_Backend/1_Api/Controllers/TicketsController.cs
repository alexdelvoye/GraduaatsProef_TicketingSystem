using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Api.Mapping;
using Api.Requests;

using Services.DTOs.Tickets;
using Services.Exceptions;
using Services.Interfaces;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/tickets")]
    // A valid JWT is required for all ticket endpoints. Role-specific rules are
    // added on individual actions.
    [Authorize]
    public class TicketsController : ApiControllerBase
    {
        private readonly ITicketService _ticketService;

        public TicketsController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }

        [HttpGet]
        public async Task<ActionResult<List<TicketListItemResponse>>> GetMyTickets()
        {
            // CurrentUserId comes from ApiControllerBase and is read from JWT
            // claims. The frontend does not send the user id in the request.
            var userId = CurrentUserId;

            var tickets = await _ticketService.GetTicketsForClientAsync(userId);

            return Ok(tickets);
        }

        [HttpGet("{ticketId:guid}")]
        public async Task<ActionResult<TicketDetailResponse>> GetTicketById(Guid ticketId)
        {
            var userId = CurrentUserId;
            var role = CurrentUserRole;

            // Service-level authorization decides whether this user may see the
            // requested ticket. Admins can view all; clients only their own.
            var ticket = await _ticketService.GetTicketByIdAsync(ticketId, userId, role);

            return Ok(ticket);
        }

        [HttpPost]
        // Only clients create support tickets. Admins reply/manage tickets.
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<TicketDetailResponse>> CreateTicket(CreateTicketRequest request)
        {
            var userId = CurrentUserId;

            var ticket = await _ticketService.CreateTicketAsync(userId, request);

            // CreatedAtAction returns HTTP 201 and points clients to the route
            // where the newly created ticket can be fetched.
            return CreatedAtAction(nameof(GetTicketById), new { ticketId = ticket.Id }, ticket);
        }

        [HttpPost("with-attachments")]
        // Multipart create is used when the first ticket message has files.
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<TicketDetailResponse>> CreateTicketWithAttachments(
            [FromForm] CreateTicketWithAttachmentsFormRequest formRequest)
        {
            // Files are read directly from Request.Form.Files because React
            // Native, Expo Web and browser clients can serialize multipart file
            // fields slightly differently. The text fields still bind through
            // formRequest so DataAnnotations can validate them normally.
            var uploadedFiles = Request.Form.Files;

            if (uploadedFiles.Count == 0)
                throw new BadRequestException("At least one attachment is required.");

            // Translate the API-specific form request to the service DTO. This
            // keeps TicketService independent from ASP.NET attributes such as
            // [FromForm] and from multipart naming details.
            var request = new CreateTicketRequest
            {
                Title = formRequest.Title,
                Category = formRequest.Category,
                Subject = formRequest.Subject,
                InitialMessage = formRequest.InitialMessage
            };

            var fileRequests = FormFileMapper.ToFileUploadRequests(uploadedFiles);

            var ticket = await _ticketService.CreateTicketAsync(
                CurrentUserId,
                request,
                fileRequests);

            return CreatedAtAction(nameof(GetTicketById), new { ticketId = ticket.Id }, ticket);
        }

        [HttpPatch("{ticketId:guid}/status")]
        // Admins can manage the full workflow. Clients can close or reopen
        // their own tickets. The service/domain layer enforces the exact rule.
        public async Task<IActionResult> UpdateTicketStatus(Guid ticketId, UpdateTicketStatusRequest request)
        {
            await _ticketService.UpdateTicketStatusAsync(
                ticketId,
                CurrentUserId,
                CurrentUserRole,
                request);

            // NoContent means the update succeeded but there is no response body.
            return NoContent();
        }
    }
}
