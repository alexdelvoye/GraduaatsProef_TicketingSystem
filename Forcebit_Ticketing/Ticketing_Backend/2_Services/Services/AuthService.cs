using Domain.Entities;

using Microsoft.Extensions.Logging;

using Services.DTOs.Auth;
using Services.DTOs.Users;
using Services.Exceptions;
using Services.Interfaces;

namespace Services.Services
{
    // Application service for authentication use cases.
    // It owns registration/login flow, while TokenService owns token creation
    // and User owns user creation defaults.
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUserRepository userRepository,
            ITokenService tokenService,
            ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _logger = logger;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            // Normalize email before storing or comparing. This prevents
            // Alex@Test.com and alex@test.com from becoming separate accounts.
            var email = request.Email.Trim().ToLowerInvariant();

            if (request.Password != request.ConfirmPassword)
                throw new BadRequestException("Passwords do not match.");

            // Uniqueness is checked before creating the user so the API can
            // return a friendly validation-style error.
            if (await _userRepository.EmailExistsAsync(email))
                throw new BadRequestException("Email is already in use.");

            // User.CreateClient keeps normal registration defaults in the domain
            // entity instead of scattering them through service code.
            var user = User.CreateClient(
                request.Name,
                request.CompanyName,
                email,
                // Passwords are never stored as plain text. BCrypt stores a
                // salted hash that can be verified during login.
                BCrypt.Net.BCrypt.HashPassword(request.Password),
                DateTime.UtcNow);

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            _logger.LogInformation(
                "Registered new client account {UserId} for {Email}.",
                user.Id,
                user.Email);

            var token = _tokenService.CreateToken(user);

            // Register returns the same shape as login so the frontend can sign
            // the user in immediately after a successful registration.
            return new AuthResponse
            {
                Token = token,
                User = new UserResponse
                {
                    Id = user.Id,
                    Name = user.Name,
                    CompanyName = user.CompanyName,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    CreatedAt = user.CreatedAt
                }
            };
        }

        public async Task<AuthResponse?> LoginAsync(LoginRequest request)
        {
            // Login uses the same normalization as registration.
            var email = request.Email.Trim().ToLowerInvariant();

            var user = await _userRepository.GetByEmailAsync(email);

            if (user == null)
            {
                // Warning is appropriate: failed login is important, but not a
                // crash or server bug.
                _logger.LogWarning("Login failed for unknown email {Email}.", email);
                return null;
            }

            // BCrypt verifies the raw password against the stored hash. The
            // original password cannot be recovered from the hash.
            var passwordValid = BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash);

            if (!passwordValid)
            {
                _logger.LogWarning("Login failed for user {UserId}.", user.Id);
                return null;
            }

            _logger.LogInformation("User {UserId} logged in.", user.Id);

            // Token creation is delegated to TokenService to keep AuthService
            // focused on the authentication use case.
            var token = _tokenService.CreateToken(user);

            return new AuthResponse
            {
                Token = token,
                User = new UserResponse
                {
                    Id = user.Id,
                    Name = user.Name,
                    CompanyName = user.CompanyName,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    CreatedAt = user.CreatedAt
                }
            };
        }
    }
}
