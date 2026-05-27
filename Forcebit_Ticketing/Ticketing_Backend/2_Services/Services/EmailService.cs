using System.Net;
using System.Net.Http.Json;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Services.DTOs.Attachments;
using Services.Interfaces;
using Services.Options;

namespace Services.Services
{
    // Brevo-backed email service for ticket notifications.
    // TicketService decides who should be notified; this service only builds and
    // sends the email through the provider.
    public class EmailService : IEmailService
    {
        private const string BrevoEmailEndpoint = "https://api.brevo.com/v3/smtp/email";

        private readonly EmailOptions _emailOptions;
        private readonly HttpClient _httpClient;
        private readonly ILogger<EmailService> _logger;

        public EmailService(
            IOptions<EmailOptions> emailOptions,
            HttpClient httpClient,
            ILogger<EmailService> logger)
        {
            _emailOptions = emailOptions.Value;
            _httpClient = httpClient;
            _logger = logger;
        }

        public Task SendTicketMessageEmailAsync(
            string receiverEmail,
            string ticketTitle,
            string messageBody,
            string senderRole,
            IReadOnlyCollection<EmailAttachmentRequest>? attachments = null)
        {
            return SendEmailAsync(
                receiverEmail,
                $"New message on ticket: {ticketTitle}",
                BuildBody(
                    "New ticket message",
                    $"A new message was sent by {senderRole}.",
                    ticketTitle,
                    "Message",
                    messageBody),
                attachments);
        }

        public Task SendTicketStatusUpdatedEmailAsync(
            string receiverEmail,
            string ticketTitle,
            string newStatus,
            string changedByRole)
        {
            // Closing a ticket is a more important lifecycle event than a
            // normal progress update, so it gets a clearer subject line. This
            // also makes it easier for the client to find in a crowded mailbox.
            if (string.Equals(newStatus, "Closed", StringComparison.OrdinalIgnoreCase))
            {
                return SendEmailAsync(
                    receiverEmail,
                    $"Ticket closed: {ticketTitle}",
                    BuildBody(
                        "Ticket closed",
                        $"The ticket was closed by {changedByRole}.",
                        ticketTitle,
                        "Status",
                        "Status: Closed"));
            }

            return SendEmailAsync(
                receiverEmail,
                $"Ticket status updated: {ticketTitle}",
                BuildBody(
                    "Ticket status updated",
                    $"The ticket status was updated by {changedByRole}.",
                    ticketTitle,
                    "New status",
                    $"New status: {newStatus}"));
        }

        private async Task SendEmailAsync(
            string receiverEmail,
            string subject,
            string htmlBody,
            IReadOnlyCollection<EmailAttachmentRequest>? attachments = null)
        {
            if (string.IsNullOrWhiteSpace(_emailOptions.ApiKey))
            {
                // Local development should still work when no Brevo API key
                // is configured. The warning makes skipped emails visible.
                _logger.LogWarning(
                    "Email to {Email} skipped because no Brevo API key is configured.",
                    receiverEmail);

                return;
            }

            if (string.IsNullOrWhiteSpace(receiverEmail))
            {
                _logger.LogWarning("Email skipped because receiver email is missing.");
                return;
            }

            var brevoAttachments = attachments?
                .Select(attachment => new
                {
                    name = attachment.FileName,
                    content = Convert.ToBase64String(attachment.Content)
                })
                .ToArray();

            // Brevo's transactional email endpoint expects sender/to as nested
            // objects. Attachments are optional and use base64 content because
            // local upload paths are not public absolute URLs.
            var message = new Dictionary<string, object>
            {
                ["sender"] = new
                {
                    name = _emailOptions.FromName,
                    email = _emailOptions.FromEmail
                },
                ["to"] = new[]
                {
                    new
                    {
                        email = receiverEmail
                    }
                },
                ["subject"] = subject,
                ["htmlContent"] = htmlBody
            };

            if (brevoAttachments?.Length > 0)
            {
                message["attachment"] = brevoAttachments;
            }

            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Post, BrevoEmailEndpoint);

                // Brevo uses an api-key header instead of Bearer auth.
                request.Headers.Add("api-key", _emailOptions.ApiKey);
                request.Headers.Accept.ParseAdd("application/json");
                request.Content = JsonContent.Create(message);

                var response = await _httpClient.SendAsync(request);
                var providerBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError(
                        "Brevo email notification to {Email} with subject {Subject} failed with status {StatusCode}. Response: {Response}",
                        receiverEmail,
                        subject,
                        (int)response.StatusCode,
                        providerBody);

                    return;
                }

                // Brevo returns a provider message id in the response body.
                // Logging it helps distinguish "our API sent the request" from
                // "the mailbox received the email" during testing.
                _logger.LogInformation(
                    "Email notification sent from {FromEmail} to {Email} with subject {Subject}. Brevo response: {Response}",
                    _emailOptions.FromEmail,
                    receiverEmail,
                    subject,
                    providerBody);
            }
            catch (Exception exception)
            {
                // Email is important, but a temporary provider failure should
                // not roll back ticket creation, replies, or status updates.
                _logger.LogError(
                    exception,
                    "Email notification to {Email} with subject {Subject} failed.",
                    receiverEmail,
                    subject);
            }
        }

        private static string BuildBody(
            string heading,
            string intro,
            string ticketTitle,
            string detailLabel,
            string detail)
        {
            // WebUtility.HtmlEncode prevents user-entered ticket text from being
            // interpreted as HTML in the outgoing email.
            var safeHeading = WebUtility.HtmlEncode(heading);
            var safeIntro = WebUtility.HtmlEncode(intro);
            var safeTicketTitle = WebUtility.HtmlEncode(ticketTitle);
            var safeDetailLabel = WebUtility.HtmlEncode(detailLabel);
            // Preserve line breaks from multi-line ticket messages inside the
            // email while still keeping the text HTML-encoded.
            var safeDetail = WebUtility.HtmlEncode(detail)
                .Replace("\r\n", "<br>")
                .Replace("\n", "<br>");

            return $"""
                <div style="margin:0; padding:24px; background:#f4f7fb; font-family:Arial, Helvetica, sans-serif; color:#172033;">
                    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #dde5f0; border-radius:8px; overflow:hidden;">
                        <div style="padding:22px 24px; background:#12355b; color:#ffffff;">
                            <h1 style="margin:0; font-size:22px; line-height:1.3;">{safeHeading}</h1>
                        </div>
                        <div style="padding:24px;">
                            <p style="margin:0 0 18px 0; font-size:15px; line-height:1.6;">{safeIntro}</p>
                            <div style="margin:0 0 18px 0; padding:14px 16px; background:#eef4fb; border-left:4px solid #1f6feb;">
                                <div style="font-size:12px; font-weight:bold; text-transform:uppercase; color:#526071; margin-bottom:6px;">Ticket</div>
                                <div style="font-size:16px; font-weight:bold; color:#172033;">{safeTicketTitle}</div>
                            </div>
                            <div style="margin:0 0 8px 0; font-size:12px; font-weight:bold; text-transform:uppercase; color:#526071;">{safeDetailLabel}</div>
                            <div style="padding:16px; background:#ffffff; border:1px solid #d9e2ec; border-radius:6px; font-size:15px; line-height:1.6; color:#172033;">
                                {safeDetail}
                            </div>
                            <p style="margin:22px 0 0 0; font-size:12px; line-height:1.5; color:#68778a;">This is an automatic notification from Forcebit Support.</p>
                        </div>
                    </div>
                </div>
                """;
        }
    }
}
