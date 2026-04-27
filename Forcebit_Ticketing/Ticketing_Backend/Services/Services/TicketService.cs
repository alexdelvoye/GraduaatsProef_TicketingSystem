using Domain.Entities;
using Domain.Enums;
using Services.DTOs.Tickets;
using Services.Interfaces;

namespace Services.Services
{
    public class TicketService(ITicketRepository ticketRepository) : ITicketService
    {
        private readonly ITicketRepository _ticketRepository = ticketRepository;

        public async Task<TicketResponse> CreateTicketAsync(CreateTicketRequest request)
        {
            var ticket = new Ticket
            {
                Title = request.Title,
                Category = request.Category,
                Description = request.Description,
                Status = TicketStatus.Open
            };

            await _ticketRepository.AddAsync(ticket);

            return new TicketResponse
            {
                Id = ticket.Id,
                Title = ticket.Title,
                Status = ticket.Status.ToString()
            };
        }
    }
}
