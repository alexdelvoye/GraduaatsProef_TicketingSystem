using Domain.Entities;

namespace Services.Interfaces
{
    // Persistence contract for user queries. The interface lives in Services so
    // services can depend on an abstraction; the EF Core implementation lives in
    // Persistence.
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByEmailAsync(string email);

        // Returns client users with the related ticket data needed for admin
        // dashboard counts.
        Task<List<User>> GetClientsAsync();

        // Account deletion needs file paths before ticket/attachment rows are
        // removed from the database.
        Task<List<string>> GetAttachmentPathsForClientTicketsAsync(Guid userId);

        Task AddAsync(User user);
        Task DeleteAsync(User user);
        Task<bool> EmailExistsAsync(string email);
        Task SaveChangesAsync();
    }
}
