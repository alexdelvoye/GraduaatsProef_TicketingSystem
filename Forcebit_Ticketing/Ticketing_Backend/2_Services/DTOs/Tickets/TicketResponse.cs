
namespace Services.DTOs.Tickets
{
    public class TicketResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Category { get; set; }
        public string Subject { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
