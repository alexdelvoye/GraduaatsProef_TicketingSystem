using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.DTOs.Tickets;
using Services.DTOs.Users;
using Services.Interfaces;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
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
            var clients = await _userService.GetClientsAsync();
            return Ok(clients);
        }

        [HttpGet("clients/{clientId:guid}/tickets")]
        public async Task<ActionResult<List<TicketListItemResponse>>> GetClientTickets(Guid clientId)
        {
            var tickets = await _ticketService.GetTicketsForClientAsync(clientId);
            return Ok(tickets);
        }

        [HttpGet("tickets")]
        public async Task<ActionResult<List<TicketListItemResponse>>> GetAllTickets()
        {
            var tickets = await _ticketService.GetAllTicketsAsync();
            return Ok(tickets);
        }
    }
}
