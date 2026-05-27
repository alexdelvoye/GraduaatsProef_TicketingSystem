using Domain.Entities;

namespace Services.Interfaces
{
    // Repository contract for attachment metadata. The physical file content is
    // handled by IFileStorageService, so this repository only knows database rows.
    public interface IAttachmentRepository
    {
        Task<TicketAttachment?> GetByIdAsync(Guid id);
        Task AddAsync(TicketAttachment attachment);
        Task SaveChangesAsync();
    }
}
