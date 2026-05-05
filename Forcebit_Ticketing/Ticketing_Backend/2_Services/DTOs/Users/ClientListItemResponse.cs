
namespace Services.DTOs.Users
{
    public class ClientListItemResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int OpenTicketCount { get; set; }
        public int ClosedTicketCount { get; set; }
    }
}
