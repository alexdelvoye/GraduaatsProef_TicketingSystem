using System.ComponentModel.DataAnnotations;

namespace Services.Options
{
    // Options class for email-related settings. API startup binds this from the
    // Email section in appsettings and environment variables.
    public class EmailOptions
    {
        // Brevo API key. Keep real values in user secrets or environment
        // variables, not in source-controlled appsettings files.
        public string ApiKey { get; set; } = string.Empty;

        // Brevo requires the sender address to be a verified sender/domain in
        // the Brevo account. If this is not verified, Brevo rejects the email.
        [Required]
        [EmailAddress]
        public string FromEmail { get; set; } = string.Empty;

        // Human-readable sender name shown in the recipient's mailbox.
        [Required]
        public string FromName { get; set; } = "Forcebit Support";
    }
}
