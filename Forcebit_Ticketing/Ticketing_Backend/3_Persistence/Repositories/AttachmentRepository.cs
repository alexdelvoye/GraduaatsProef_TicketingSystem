using Domain.Entities;

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
