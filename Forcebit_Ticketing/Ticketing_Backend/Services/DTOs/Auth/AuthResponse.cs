using System;
using System.Collections.Generic;
using System.Text;

namespace Services.DTOs.Auth
{
    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserResponse User { get; set; } = new();
    }
}
