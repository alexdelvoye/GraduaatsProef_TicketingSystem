using Services.DTOs.Users;

namespace Services.DTOs.Auth
{
    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserResponse User { get; set; } = new();
    }
}
