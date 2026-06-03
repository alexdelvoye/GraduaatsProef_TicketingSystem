using Domain.Entities;
using Domain.Enums;

using Services.DTOs.Users;
using Services.Exceptions;
using Services.Interfaces;

namespace Services.Services
{
    // Application service for user/admin overview use cases.
    // Email provider code does not belong here; notification sending is handled
    // by EmailService so this service stays focused on users.
    public class UserService : IUserService
    {
        private readonly IFileStorageService _fileStorageService;
        private readonly IUserRepository _userRepository;

        public UserService(
            IFileStorageService fileStorageService,
            IUserRepository userRepository)
        {
            _fileStorageService = fileStorageService;
            _userRepository = userRepository;
        }

        public async Task<List<ClientListItemResponse>> GetClientsAsync()
        {
            var clients = await _userRepository.GetClientsAsync();

            var result = new List<ClientListItemResponse>();

            foreach (var client in clients)
            {
                // Count tickets in the service because these counts are part of
                // the admin use case, not properties stored on the user table.
                var newCount = client.Tickets.Count(t => t.Status == TicketStatus.New);
                var openCount = client.Tickets.Count(t => t.Status == TicketStatus.Open);
                var closedCount = client.Tickets.Count(t => t.Status == TicketStatus.Closed);

                result.Add(new ClientListItemResponse
                {
                    Id = client.Id,
                    Name = client.Name,
                    CompanyName = client.CompanyName,
                    Email = client.Email,
                    NewTicketCount = newCount,
                    OpenTicketCount = openCount,
                    ClosedTicketCount = closedCount
                });
            }

            return result;
        }

        public async Task<UserResponse> UpdateProfileAsync(
            Guid userId,
            UpdateProfileRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null)
                throw new NotFoundException("User not found.");

            var normalizedEmail = request.Email
                .Trim()
                .ToLowerInvariant();

            var existingUserWithEmail = await _userRepository.GetByEmailAsync(
                normalizedEmail);

            // Email must stay unique, but keeping the same email is allowed.
            if (existingUserWithEmail != null && existingUserWithEmail.Id != userId)
                throw new BadRequestException("This email address is already in use.");

            // CompanyName and Role are not changed here. They are controlled by
            // registration/admin data, not by normal profile editing.
            user.Name = request.Name.Trim();
            user.Email = normalizedEmail;

            await _userRepository.SaveChangesAsync();

            return MapToUserResponse(user);
        }

        public async Task DeleteProfileAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null)
                throw new NotFoundException("User not found.");

            // The seeded admin account is operational project data. Removing it
            // from the profile screen would lock the admin side out, so only
            // client accounts can remove themselves here.
            if (user.Role == UserRole.Admin)
                throw new ForbiddenException(
                    "Admin accounts cannot be removed from the profile page.");

            var attachmentPaths =
                await _userRepository.GetAttachmentPathsForClientTicketsAsync(
                    userId);

            foreach (var attachmentPath in attachmentPaths)
            {
                // Database deletion removes attachment rows; this removes the
                // actual uploaded files so account removal does not leave local
                // storage behind.
                await _fileStorageService.DeleteFileIfExistsAsync(attachmentPath);
            }

            await _userRepository.DeleteAsync(user);
            await _userRepository.SaveChangesAsync();
        }

        private static UserResponse MapToUserResponse(User user)
        {
            return new UserResponse
            {
                Id = user.Id,
                Name = user.Name,
                CompanyName = user.CompanyName,
                Email = user.Email,
                Role = user.Role.ToString(),
                CreatedAt = user.CreatedAt
            };
        }
    }
}
