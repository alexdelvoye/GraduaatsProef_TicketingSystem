using Services.DTOs.Attachments;

namespace Services.Interfaces
{
    // Application-facing email contract.
    // TicketService depends on this interface instead of Brevo directly, so the
    // ticket workflow does not care which email provider sends the message.
    public interface IEmailService
    {
        // Sent when an admin adds a visible reply to a client's ticket.
        Task SendTicketMessageEmailAsync(
            string receiverEmail,
            string ticketTitle,
            string messageBody,
            string senderRole,
            IReadOnlyCollection<EmailAttachmentRequest>? attachments = null);

        // Sent when an admin changes a ticket status. Closed tickets receive a
        // special subject/body inside EmailService.
        Task SendTicketStatusUpdatedEmailAsync(
            string receiverEmail,
            string ticketTitle,
            string newStatus,
            string changedByRole);
    }
}
