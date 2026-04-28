using Domain.Entities;
using Persistence.Data;
using Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Repositories
{
    public class TicketRepository : ITicketRepository
    {
        private readonly AppDbContext _context;

        public TicketRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Ticket?> GetByIdAsync(Guid id)
        {
            return await _context.Tickets
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<Ticket?> GetDetailByIdAsync(Guid id)
        {
            return await _context.Tickets
                .Include(t => t.Client)
                .Include(t => t.Messages)
                    .ThenInclude(m => m.Sender)
                .Include(t => t.Messages)
                    .ThenInclude(m => m.Attachments)
                .Include(t => t.Attachments)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<List<Ticket>> GetTicketsByClientIdAsync(Guid clientId)
        {
            return await _context.Tickets
                .Where(t => t.ClientId == clientId)
                .OrderByDescending(t => t.UpdatedAt)
                .ToListAsync();
        }

        public async Task<List<Ticket>> GetAllTicketsAsync()
        {
            return await _context.Tickets
                .Include(t => t.Client)
                .OrderByDescending(t => t.UpdatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(Ticket ticket)
        {
            await _context.Tickets.AddAsync(ticket);
        }

        public async Task AddMessageAsync(TicketMessage message)
        {
            await _context.TicketMessages.AddAsync(message);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
