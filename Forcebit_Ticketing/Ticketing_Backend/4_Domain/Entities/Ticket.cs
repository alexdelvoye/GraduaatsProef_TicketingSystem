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

        public TicketStatus Status { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public DateTime? ClosedAt { get; set; }

        public ICollection<TicketMessage> Messages { get; set; } = new List<TicketMessage>();

        public ICollection<TicketAttachment> Attachments { get; set; } = new List<TicketAttachment>();

        // Factory method: instead of every service manually setting default
        // ticket values, ticket creation rules live with the Ticket entity.
        public static Ticket Create(
            Guid clientId,
            string title,
            TicketCategory category,
            TicketSubject subject,
            DateTime createdAt)
        {
            return new Ticket
            {
                Id = Guid.NewGuid(),
                ClientId = clientId,
                Title = title.Trim(),
                Category = category,
                Subject = subject,
                Status = TicketStatus.Open,
                CreatedAt = createdAt,
                UpdatedAt = createdAt
            };
        }

        public TicketMessage AddMessage(
            Guid senderId,
            string message,
            bool moveToInProgress,
            DateTime createdAt)
        {
            // Adding a message also updates the ticket timestamp and may change
            // status. This is domain behavior, so it belongs here instead of in
            // a controller.
            var ticketMessage = new TicketMessage
            {
                Id = Guid.NewGuid(),
                TicketId = Id,
                SenderId = senderId,
                Message = message.Trim(),
                CreatedAt = createdAt
            };

            Messages.Add(ticketMessage);
            UpdatedAt = createdAt;

            if (moveToInProgress)
            {
                Status = TicketStatus.InProgress;
                ClosedAt = null;
            }

            return ticketMessage;
        }

        public void ChangeStatus(TicketStatus status, DateTime updatedAt)
        {
            // ClosedAt is derived from the status. Keeping it here prevents
            // services from forgetting to clear/set it consistently.
            Status = status;
            UpdatedAt = updatedAt;
            ClosedAt = status == TicketStatus.Closed ? updatedAt : null;
        }
    }
}
