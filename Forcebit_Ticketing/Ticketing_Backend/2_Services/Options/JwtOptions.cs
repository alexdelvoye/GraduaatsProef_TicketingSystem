
using System.ComponentModel.DataAnnotations;

namespace Services.Options
{
    // Options class for the "Jwt" section in appsettings.json.
    // Program.cs validates these settings at startup with ValidateDataAnnotations.
    public class JwtOptions
    {
        // Symmetric signing key used by TokenService to sign tokens and by
        // ASP.NET authentication middleware to validate them. It must be long
        // enough to be safe for HMAC signing.
        [Required]
        [MinLength(32)]
        public string Key { get; set; } = string.Empty;

        // Token lifetime. Shorter lifetimes are safer; longer lifetimes are more
        // convenient for local demos because users stay logged in.
        [Range(1, 365)]
        public int ExpirationDays { get; set; } = 7;
    }
}
