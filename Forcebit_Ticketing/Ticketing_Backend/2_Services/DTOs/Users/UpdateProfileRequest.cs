using System.ComponentModel.DataAnnotations;

namespace Services.DTOs.Users
{
    // Clients/admins may edit only their personal contact fields. Company and
    // role are intentionally absent so the API cannot update them by accident.
    public class UpdateProfileRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;
    }
}
