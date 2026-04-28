using Domain.Enums;
using Services.DTOs.Users;
using Services.Interfaces;

namespace Services.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ITicketRepository _ticketRepository;

        public UserService(
            IUserRepository userRepository,
            ITicketRepository ticketRepository)
        {
            _userRepository = userRepository;
            _ticketRepository = ticketRepository;
        }

        public async Task<List<ClientListItemResponse>> GetClientsAsync()
        {
            var clients = await _userRepository.GetClientsAsync();

            var result = new List<ClientListItemResponse>();

            foreach (var client in clients)
            {
                var tickets = await _ticketRepository.GetTicketsByClientIdAsync(client.Id);

                var openCount = tickets.Count(t => t.Status != TicketStatus.Closed);
                var closedCount = tickets.Count(t => t.Status == TicketStatus.Closed);

                result.Add(new ClientListItemResponse
                {
                    Id = client.Id,
                    Name = client.Name,
                    CompanyName = client.CompanyName,
                    Email = client.Email,
                    OpenTicketCount = openCount,
                    ClosedTicketCount = closedCount
                });
            }

            return result;
        }
    }
}