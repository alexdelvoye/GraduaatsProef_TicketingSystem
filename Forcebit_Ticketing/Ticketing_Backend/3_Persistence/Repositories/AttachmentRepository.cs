using Domain.Entities;

using Microsoft.EntityFrameworkCore;

using Persistence.Data;

using Services.Interfaces;

namespace Persistence.Repositories
{
    // Attachment repository stores metadata. The actual file bytes are handled
    // by IFileStorageService, not by this repository.
    public class AttachmentRepository : IAttachmentRepository
    {
        private readonly AppDbContext _context;

        public AttachmentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<TicketAttachment?> GetByIdAsync(Guid id)
        {
            return await _context.TicketAttachments
                .AsNoTracking()
                .FirstOrDefaultAsync(attachment => attachment.Id == id);
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
