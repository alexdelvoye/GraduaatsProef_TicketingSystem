using Domain.Common;
using Domain.Enums;

namespace Domain.Entities
{
    public class Ticket : BaseEntity
    {
        public Guid ClientId { get; set; }

        public User? Client { get; set; }

        public string Title { get; set; } = string.Empty;

        public TicketCategory Category { get; set; }

        public TicketSubject Subject { get; set; }

        public string Description { get; set; } = string.Empty;

        public TicketStatus Status { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public DateTime? ClosedAt { get; set; }

        public ICollection<TicketMessage> Messages { get; set; } = new List<TicketMessage>();

        public ICollection<TicketAttachment> Attachments { get; set; } = new List<TicketAttachment>();
    }
}
