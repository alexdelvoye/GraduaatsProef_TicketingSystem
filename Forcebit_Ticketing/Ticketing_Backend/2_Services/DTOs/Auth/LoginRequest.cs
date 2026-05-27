using System.ComponentModel.DataAnnotations;

namespace Services.DTOs.Auth
{
    // Request DTO for login. DataAnnotations are used by ASP.NET model
    // validation before AuthService receives the request.
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
