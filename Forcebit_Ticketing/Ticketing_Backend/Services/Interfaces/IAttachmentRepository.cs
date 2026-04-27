using Domain.Entities;

namespace Services.Interfaces
{
    public interface IAttachmentRepository
    {
        Task AddAsync(TicketAttachment attachment);
        Task SaveChangesAsync();
    }
}
