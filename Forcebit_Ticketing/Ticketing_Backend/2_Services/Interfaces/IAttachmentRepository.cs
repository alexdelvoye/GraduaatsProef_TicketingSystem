using Domain.Entities;

namespace Services.Interfaces
{
    // Repository contract for attachment metadata. The physical file content is
    // handled by IFileStorageService, so this repository only knows database rows.
    public interface IAttachmentRepository
    {
        // Used for protected downloads and ownership checks.
        Task<TicketAttachment?> GetByIdAsync(Guid id);

        // Stores only metadata/path; file bytes are already saved separately.
        Task AddAsync(TicketAttachment attachment);

        Task SaveChangesAsync();
    }
}
