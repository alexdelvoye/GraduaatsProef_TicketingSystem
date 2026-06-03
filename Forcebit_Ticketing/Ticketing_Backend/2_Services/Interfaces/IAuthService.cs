using Services.DTOs.Auth;

namespace Services.Interfaces
{
    // Authentication use-case contract. The API layer does not hash passwords or
    // create JWTs itself; it asks this service to register or log in a user.
    public interface IAuthService
    {
        // Register returns AuthResponse so the frontend can immediately store
        // the JWT and user data after creating an account.
        Task<AuthResponse> RegisterAsync(RegisterRequest request);

        // Null means the credentials were invalid. The controller translates
        // that application result into HTTP 401 Unauthorized.
        Task<AuthResponse?> LoginAsync(LoginRequest request);
    }
}
