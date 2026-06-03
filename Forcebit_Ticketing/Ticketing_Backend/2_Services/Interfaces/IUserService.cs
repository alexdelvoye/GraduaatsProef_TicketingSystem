using Services.DTOs.Users;

namespace Services.Interfaces
{
    // User/account use-case contract. Admin overview, profile editing, and
    // profile deletion are grouped here because they all operate on users.
    public interface IUserService
    {
        // Admin dashboard summaries for client accounts.
        Task<List<ClientListItemResponse>> GetClientsAsync();

        // Profile editing uses the authenticated user's id, not an id supplied
        // by the frontend.
        Task<UserResponse> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);

        // Deletes the current client account and its ticket data. Admin account
        // deletion is intentionally refused in the service implementation.
        Task DeleteProfileAsync(Guid userId);
    }
}
