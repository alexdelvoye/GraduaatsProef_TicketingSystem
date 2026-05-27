using Services.DTOs.Users;

namespace Services.Interfaces
{
    public interface IUserService
    {
        Task<List<ClientListItemResponse>> GetClientsAsync();
        Task<UserResponse> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
        Task DeleteProfileAsync(Guid userId);
    }
}
