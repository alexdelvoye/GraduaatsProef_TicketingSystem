using Domain.Enums;
using Services.DTOs.Users;
using Services.Interfaces;

namespace Services.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<List<ClientListItemResponse>> GetClientsAsync()
        {
            var clients = await _userRepository.GetClientsAsync();

            var result = new List<ClientListItemResponse>();

            foreach (var client in clients)
            {
                var openCount = client.Tickets.Count(t => t.Status != TicketStatus.Closed);
                var closedCount = client.Tickets.Count(t => t.Status == TicketStatus.Closed);

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
