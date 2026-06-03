
namespace Services.DTOs.Users
{
    // Compact admin-dashboard DTO for a client row. It deliberately includes
    // ticket counts, but not the full ticket list, so the clients endpoint stays
    // small and focused on client summaries.
    public class ClientListItemResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // Counts use the current workflow names. New means not handled yet,
        // Open means the conversation is active, and Closed means resolved.
        public int NewTicketCount { get; set; }
        public int OpenTicketCount { get; set; }
        public int ClosedTicketCount { get; set; }
    }
}
