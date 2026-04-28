using Domain.Entities;
using Persistence.Data;
using Services.Interfaces;

namespace Persistence.Repositories
{
    public class AttachmentRepository : IAttachmentRepository
    {
        private readonly AppDbContext _context;

        public AttachmentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(TicketAttachment attachment)
        {
            await _context.TicketAttachments.AddAsync(attachment);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
