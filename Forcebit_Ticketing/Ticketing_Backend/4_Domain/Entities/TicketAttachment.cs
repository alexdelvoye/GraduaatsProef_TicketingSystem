using Domain.Common;

namespace Domain.Entities
{
    public class TicketAttachment : BaseEntity
    {
        public Guid TicketId { get; set; }

        public Ticket? Ticket { get; set; }

        public Guid? MessageId { get; set; }

        public TicketMessage? Message { get; set; }

        public Guid UploadedById { get; set; }

        public User? UploadedBy { get; set; }

        public string FileName { get; set; } = string.Empty;

        public string FilePath { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; }
    }
}
