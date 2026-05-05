using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.DTOs.Tickets;
using Services.Interfaces;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/tickets")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _ticketService;

        public TicketsController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }

        [HttpGet]
        public async Task<ActionResult<List<TicketListItemResponse>>> GetMyTickets()
        {
            var userId = GetUserId();
            var tickets = await _ticketService.GetTicketsForClientAsync(userId);
            return Ok(tickets);
        }

        [HttpGet("{ticketId:guid}")]
        public async Task<ActionResult<TicketDetailResponse>> GetTicketById(Guid ticketId)
        {
            var userId = GetUserId();
            var role = GetUserRole();

            var ticket = await _ticketService.GetTicketByIdAsync(ticketId, userId, role);
            return Ok(ticket);
        }

        [HttpPost]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<TicketDetailResponse>> CreateTicket(CreateTicketRequest request)
        {
            var userId = GetUserId();

            var ticket = await _ticketService.CreateTicketAsync(userId, request);
            return CreatedAtAction(nameof(GetTicketById), new { ticketId = ticket.Id }, ticket);
        }

        [HttpPatch("{ticketId:guid}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTicketStatus(Guid ticketId, UpdateTicketStatusRequest request)
        {
            await _ticketService.UpdateTicketStatusAsync(ticketId, request);
            return NoContent();
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
