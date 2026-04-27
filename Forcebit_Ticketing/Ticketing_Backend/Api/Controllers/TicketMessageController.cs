using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.DTOs.Messages;
using Services.Interfaces;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/tickets/{ticketId:guid}/messages")]
    [Authorize]
    public class TicketMessagesController : ControllerBase
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
            var userId = GetUserId();
            var role = GetUserRole();

            var message = await _ticketService.AddMessageAsync(ticketId, userId, role, request);

            return Ok(message);
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
