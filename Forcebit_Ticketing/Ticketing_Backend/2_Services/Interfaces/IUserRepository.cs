using Domain.Entities;

namespace Services.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByEmailAsync(string email);
        Task<List<User>> GetClientsAsync();
        Task AddAsync(User user);
        Task<bool> EmailExistsAsync(string email);
        Task SaveChangesAsync();
    }
}
