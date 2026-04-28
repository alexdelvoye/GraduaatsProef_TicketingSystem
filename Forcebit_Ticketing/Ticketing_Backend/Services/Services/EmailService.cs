using Services.Interfaces;

namespace Services.Services
{
    public class EmailService : IEmailService
    {
        public Task SendTicketCreatedEmailAsync(string adminEmail, string ticketTitle)
        {
            Console.WriteLine($"Email to {adminEmail}: New ticket created - {ticketTitle}");
            return Task.CompletedTask;
        }

        public Task SendTicketReplyEmailAsync(string receiverEmail, string ticketTitle)
        {
            Console.WriteLine($"Email to {receiverEmail}: New reply on ticket - {ticketTitle}");
            return Task.CompletedTask;
        }

        public Task SendTicketClosedEmailAsync(string clientEmail, string ticketTitle)
        {
            Console.WriteLine($"Email to {clientEmail}: Ticket closed - {ticketTitle}");
            return Task.CompletedTask;
        }
    }
}
