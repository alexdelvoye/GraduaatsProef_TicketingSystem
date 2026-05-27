using Domain.Entities;
using Domain.Enums;

using Microsoft.EntityFrameworkCore;

using Persistence.Data;

using Services.Interfaces;

namespace Persistence.Repositories
{
    // Repository responsible for user database queries. Services depend on the
    // interface, not directly on EF Core, which keeps persistence details here.
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            // FirstOrDefaultAsync returns null when no user matches the id.
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            // Email is normalized before this method is called by AuthService.
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<List<User>> GetClientsAsync()
        {
            return await _context.Users
                // Include tickets because UserService calculates open/closed
                // ticket counts for the admin client overview.
                .Include(u => u.Tickets)
                .Where(u => u.Role == UserRole.Client)
                .OrderBy(u => u.CompanyName)
                .ToListAsync();
        }

        public async Task AddAsync(User user)
        {
            // AddAsync marks the entity for insertion. SaveChangesAsync performs
            // the actual database write.
            await _context.Users.AddAsync(user);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            // AnyAsync is efficient for existence checks because it does not
            // load a full user entity.
            return await _context.Users
                .AnyAsync(u => u.Email == email);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
