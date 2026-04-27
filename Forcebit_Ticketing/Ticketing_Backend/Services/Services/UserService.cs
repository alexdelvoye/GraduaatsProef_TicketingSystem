
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

                result.Add(new ClientListItemResponse
                {
                    Id = client.Id,
                    Name = client.Name,
                    CompanyName = client.CompanyName,
                    Email = client.Email,
                    OpenTicketCount = tickets.Count(t => t.Status != TicketStatus.Closed),
                    ClosedTicketCount = tickets.Count(t => t.Status == TicketStatus.Closed)
                });
            }

            return result;
        }
    }
}
