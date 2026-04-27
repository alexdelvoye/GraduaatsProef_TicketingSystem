
namespace Services.Interfaces
{
    public interface IEmailService
    {
        Task SendTicketCreatedEmailAsync(string adminEmail, string ticketTitle);
        Task SendTicketReplyEmailAsync(string receiverEmail, string ticketTitle);
        Task SendTicketClosedEmailAsync(string clientEmail, string ticketTitle);
    }
}
