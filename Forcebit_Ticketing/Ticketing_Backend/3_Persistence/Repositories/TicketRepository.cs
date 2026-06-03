using Domain.Entities;

using Microsoft.EntityFrameworkCore;

using Persistence.Data;

using Services.Interfaces;

namespace Persistence.Repositories
{
    // Repository for ticket queries and ticket-related inserts. The service
    // layer decides what should happen; this class decides how to query EF Core.
    public class TicketRepository : ITicketRepository
    {
        private readonly AppDbContext _context;

        public TicketRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Ticket?> GetByIdAsync(Guid id)
        {
            // Lightweight lookup without related messages/attachments.
            return await _context.Tickets
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<Ticket?> GetDetailByIdAsync(Guid id)
        {
            return await _context.Tickets
                // Split queries avoid one very large join when loading several
                // collections. This is clearer and often safer for detail pages.
                .AsSplitQuery()
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
                .Include(t => t.Client)
                .Where(t => t.ClientId == clientId)
                // UpdatedAt gives the most recently changed tickets first.
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
