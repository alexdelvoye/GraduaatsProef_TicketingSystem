using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Services.DTOs.Messages;
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
    }
}
