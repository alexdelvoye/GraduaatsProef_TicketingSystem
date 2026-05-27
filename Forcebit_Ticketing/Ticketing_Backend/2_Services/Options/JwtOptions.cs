
using System.ComponentModel.DataAnnotations;

namespace Services.Options
{
    // Options class for the "Jwt" section in appsettings.json.
    // Program.cs validates these settings at startup with ValidateDataAnnotations.
    public class JwtOptions
    {
        [Required]
        [MinLength(32)]
        public string Key { get; set; } = string.Empty;

        [Range(1, 365)]
        public int ExpirationDays { get; set; } = 7;
    }
}
