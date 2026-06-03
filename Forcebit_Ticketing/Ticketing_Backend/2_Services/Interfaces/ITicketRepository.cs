using Domain.Entities;

namespace Services.Interfaces
{
    // Persistence contract for ticket entities. Services use this interface so
    // use-case code stays separate from EF Core query details.
    public interface ITicketRepository
    {
        // Lightweight ticket lookup without conversation details.
        Task<Ticket?> GetByIdAsync(Guid id);

        // Detail lookup includes related client, message, and attachment data.
        Task<Ticket?> GetDetailByIdAsync(Guid id);

        Task<List<Ticket>> GetTicketsByClientIdAsync(Guid clientId);
        Task<List<Ticket>> GetAllTicketsAsync();

        // Add marks entities for insert. SaveChangesAsync performs the actual
        // database transaction.
        Task AddAsync(Ticket ticket);
        Task AddMessageAsync(TicketMessage message);

        Task SaveChangesAsync();
    }
}
