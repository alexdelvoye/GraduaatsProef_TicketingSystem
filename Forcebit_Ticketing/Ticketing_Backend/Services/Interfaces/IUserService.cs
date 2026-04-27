using Services.DTOs.Users;

namespace Services.Interfaces
{
    public interface IUserService
    {
        Task<List<ClientListItemResponse>> GetClientsAsync();
    }
}
