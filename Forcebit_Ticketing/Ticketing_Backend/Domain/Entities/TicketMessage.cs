using Domain.Common;

namespace Domain.Entities
{
    public class TicketMessage : BaseEntity
    {
        public Guid TicketId { get; set; }

        public Ticket? Ticket { get; set; }

        public Guid SenderId { get; set; }

        public User? Sender { get; set; }

        public string Message { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public ICollection<TicketAttachment> Attachments { get; set; } = new List<TicketAttachment>();
    }
}
