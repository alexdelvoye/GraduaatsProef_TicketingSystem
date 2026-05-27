using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Services.Interfaces;
using Services.Options;

namespace Services.Services
{
    // Placeholder email service. It keeps the rest of the application written
    // as if email exists, while currently logging the email action instead of
    // contacting a real SMTP/provider.
    public class EmailService : IEmailService
    {
        private readonly EmailOptions _emailOptions;
        private readonly ILogger<EmailService> _logger;

        public EmailService(
            IOptions<EmailOptions> emailOptions,
            ILogger<EmailService> logger)
        {
            _emailOptions = emailOptions.Value;
            _logger = logger;
        }

        public Task SendTicketCreatedEmailAsync(string adminEmail, string ticketTitle)
        {
            // Fall back to configured support email if no explicit admin email
            // was passed by the caller.
            var receiver = string.IsNullOrWhiteSpace(adminEmail)
                ? _emailOptions.SupportEmail
                : adminEmail;

            _logger.LogInformation(
                "Email to {Email}: New ticket created - {Title}",
                receiver,
                ticketTitle);

            return Task.CompletedTask;
        }

        public Task SendTicketReplyEmailAsync(string receiverEmail, string ticketTitle)
        {
            _logger.LogInformation(
                "Email to {Email}: New reply on ticket - {Title}",
                receiverEmail,
                ticketTitle);

            return Task.CompletedTask;
        }

        public Task SendTicketClosedEmailAsync(string clientEmail, string ticketTitle)
        {
            _logger.LogInformation(
                "Email to {Email}: Ticket closed - {Title}",
                clientEmail,
                ticketTitle);

            return Task.CompletedTask;
        }
    }
}
