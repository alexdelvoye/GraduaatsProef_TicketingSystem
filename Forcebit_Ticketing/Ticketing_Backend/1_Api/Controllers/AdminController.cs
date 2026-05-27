using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Services.DTOs.Tickets;
using Services.DTOs.Users;
using Services.Interfaces;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    // Every endpoint in this controller is protected for admins only. This
    // keeps admin overview routes separate from normal client ticket routes.
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ITicketService _ticketService;

        public AdminController(IUserService userService, ITicketService ticketService)
        {
            _userService = userService;
            _ticketService = ticketService;
        }

        [HttpGet("clients")]
        public async Task<ActionResult<List<ClientListItemResponse>>> GetClients()
        {
            // Admin dashboard needs client summaries, not full user entities.
            var clients = await _userService.GetClientsAsync();

            return Ok(clients);
        }

        [HttpGet("clients/{clientId:guid}/tickets")]
        public async Task<ActionResult<List<TicketListItemResponse>>> GetClientTickets(Guid clientId)
        {
            // This lets an admin inspect one client's tickets from the admin
            // screen without changing the client-facing endpoint.
            var tickets = await _ticketService.GetTicketsForClientAsync(clientId);

            return Ok(tickets);
        }

        [HttpGet("tickets")]
        public async Task<ActionResult<List<TicketListItemResponse>>> GetAllTickets()
        {
            // Admin-wide ticket list for queue management.
            var tickets = await _ticketService.GetAllTicketsAsync();

            return Ok(tickets);
        }
    }
}
