using System.ComponentModel.DataAnnotations;

namespace Services.DTOs.Auth
{
    // Request DTO for client registration. It describes what the API accepts,
    // separately from the User entity stored in the database.
    public class RegisterRequest
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string CompanyName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;

        // Compare validates that ConfirmPassword has the same value as Password.
        [Required]
        [Compare(nameof(Password))]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
