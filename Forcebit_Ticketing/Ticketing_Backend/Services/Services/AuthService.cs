using Domain.Entities;
using Domain.Enums;
using Services.DTOs.Auth;
using Services.DTOs.Users;
using Services.Exceptions;
using Services.Interfaces;

namespace Services.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;

        public AuthService(
            IUserRepository userRepository,
            ITokenService tokenService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            if (request.Password != request.ConfirmPassword)
                throw new BadRequestException("Passwords do not match.");

            if (await _userRepository.EmailExistsAsync(request.Email.ToLower()))
                throw new BadRequestException("Email is already in use.");

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                CompanyName = request.CompanyName,
                Email = request.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = UserRole.Client,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

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

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var email = request.Email.ToLower();

            var user = await _userRepository.GetByEmailAsync(email);

            if (user == null)
                throw new UnauthorizedException("Invalid email or password.");

            var passwordValid = BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash);

            if (!passwordValid)
                throw new UnauthorizedException("Invalid email or password.");

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