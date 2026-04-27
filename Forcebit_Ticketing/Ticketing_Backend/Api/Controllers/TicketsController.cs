using Microsoft.AspNetCore.Mvc;
using Services.DTOs.Tickets;

namespace Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TicketsController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> CreateTicket(CreateTicketRequest request)
        {
            var result = await _ticketService.CreateTicketAsync(request);
            return Ok(result);
        }
    }
}
