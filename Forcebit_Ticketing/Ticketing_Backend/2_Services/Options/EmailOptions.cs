
using System.ComponentModel.DataAnnotations;

namespace Services.Options
{
    // Options class for email-related settings. The current EmailService logs
    // emails, but the same settings can be reused when SMTP/MailKit is added.
    public class EmailOptions
    {
        [Required]
        [EmailAddress]
        public string SupportEmail { get; set; } = string.Empty;
    }
}
