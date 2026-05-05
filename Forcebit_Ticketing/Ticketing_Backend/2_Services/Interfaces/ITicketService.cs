using Services.DTOs.Messages;
using Services.DTOs.Tickets;

namespace Services.Interfaces
{
    public interface ITicketService
    {
        Task<List<TicketListItemResponse>> GetTicketsForClientAsync(Guid clientId);

        Task<List<TicketListItemResponse>> GetAllTicketsAsync();

        Task<TicketDetailResponse> GetTicketByIdAsync(
            Guid ticketId,
            Guid currentUserId,
            string currentUserRole);

        Task<TicketDetailResponse> CreateTicketAsync(
            Guid clientId,
            CreateTicketRequest request);

        Task UpdateTicketStatusAsync(
            Guid ticketId,
            UpdateTicketStatusRequest request);

        Task<TicketMessageResponse> AddMessageAsync(
            Guid ticketId,
            Guid senderId,
            string senderRole,
            CreateTicketMessageRequest request);
    }
}
