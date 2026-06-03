using Services.DTOs.Attachments;
using Services.DTOs.Messages;
using Services.DTOs.Tickets;

namespace Services.Interfaces
{
    // Use-case contract for all ticket workflows. Controllers call this
    // interface so they do not need to know about EF Core repositories, domain
    // rules, file storage, or email notifications.
    public interface ITicketService
    {
        // Client dashboard list. It returns lightweight list items instead of
        // full conversations so overview screens stay cheap to load.
        Task<List<TicketListItemResponse>> GetTicketsForClientAsync(Guid clientId);

        // Admin queue list. Authorization for this admin-only use case is
        // applied by the API controller before it reaches the service.
        Task<List<TicketListItemResponse>> GetAllTicketsAsync();

        // Detail loading needs the current user because viewing a ticket is a
        // business rule: admins may view all tickets, clients only their own.
        Task<TicketDetailResponse> GetTicketByIdAsync(
            Guid ticketId,
            Guid currentUserId,
            string currentUserRole);

        // Creates the ticket container plus the first conversation message.
        // Optional attachments belong to that first message.
        Task<TicketDetailResponse> CreateTicketAsync(
            Guid clientId,
            CreateTicketRequest request,
            IReadOnlyCollection<FileUploadRequest>? attachments = null);

        // Status updates are accepted as a request DTO, but the service/domain
        // layer decides whether the authenticated user may make that change.
        Task UpdateTicketStatusAsync(
            Guid ticketId,
            Guid currentUserId,
            string currentUserRole,
            UpdateTicketStatusRequest request);

        // Adds a reply from the authenticated sender. Attachments are optional
        // and follow the same message ownership as normal text replies.
        Task<TicketMessageResponse> AddMessageAsync(
            Guid ticketId,
            Guid senderId,
            string senderRole,
            CreateTicketMessageRequest request,
            IReadOnlyCollection<FileUploadRequest>? attachments = null);
    }
}
