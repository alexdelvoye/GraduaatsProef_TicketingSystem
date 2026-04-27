using Domain.Entities;

namespace Services.Interfaces
{
    public interface ITicketRepository
    {
        Task<Ticket?> GetByIdAsync(Guid id);
        Task<Ticket?> GetDetailByIdAsync(Guid id);
        Task<List<Ticket>> GetTicketsByClientIdAsync(Guid clientId);
        Task<List<Ticket>> GetAllTicketsAsync();

        Task AddAsync(Ticket ticket);
        Task AddMessageAsync(TicketMessage message);

        Task SaveChangesAsync();
    }
}
