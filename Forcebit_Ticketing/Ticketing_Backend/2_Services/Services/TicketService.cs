using Domain.Entities;
using Domain.Enums;
using Domain.Rules;

using Microsoft.Extensions.Logging;

using Services.DTOs.Attachments;
using Services.DTOs.Messages;
using Services.DTOs.Tickets;
using Services.Exceptions;
using Services.Interfaces;

namespace Services.Services
{
    // Application service/use-case class.
    // It coordinates repositories, domain rules, logging and email. The service
    // does not know HTTP details; controllers translate HTTP requests into calls
    // to this class.
    public class TicketService : ITicketService
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;
        private readonly ILogger<TicketService> _logger;

        public TicketService(
            ITicketRepository ticketRepository,
            IUserRepository userRepository,
            IEmailService emailService,
            ILogger<TicketService> logger)
        {
            _ticketRepository = ticketRepository;
            _userRepository = userRepository;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<List<TicketListItemResponse>> GetTicketsForClientAsync(Guid clientId)
        {
            // Clients only need their own tickets, so the repository query is
            // filtered before mapping to DTOs.
            var tickets = await _ticketRepository.GetTicketsByClientIdAsync(clientId);

            // The API returns DTOs, not EF entities. This protects the database
            // model from leaking into the frontend contract.
            return tickets.Select(MapToTicketListItemResponse).ToList();
        }

        public async Task<List<TicketListItemResponse>> GetAllTicketsAsync()
        {
            // Admin overview needs all tickets. Authorization for admin-only
            // routes is handled at controller level with [Authorize(Roles=...)].
            var tickets = await _ticketRepository.GetAllTicketsAsync();

            return tickets.Select(MapToTicketListItemResponse).ToList();
        }

        public async Task<TicketDetailResponse> GetTicketByIdAsync(
            Guid ticketId,
            Guid currentUserId,
            string currentUserRole)
        {
            // Detail queries include related data such as messages and
            // attachments. That is why this uses GetDetailByIdAsync instead of
            // a smaller list query.
            var ticket = await _ticketRepository.GetDetailByIdAsync(ticketId);

            if (ticket == null)
                throw new NotFoundException("Ticket not found.");

            // Roles arrive from JWT claims as strings. Convert them to the
            // domain enum before using domain rules.
            if (!UserRoleRules.TryParse(currentUserRole, out var role))
                throw new ForbiddenException("Invalid user role.");

            // Authorization is a business rule here: clients may only see their
            // own tickets, while admins may see every ticket.
            if (!TicketRules.CanAccess(ticket, currentUserId, role))
                throw new ForbiddenException("You are not allowed to view this ticket.");

            return MapToTicketDetailResponse(ticket);
        }

        public async Task<TicketDetailResponse> CreateTicketAsync(
            Guid clientId,
            CreateTicketRequest request)
        {
            // Verify the authenticated client still exists before creating a
            // ticket connected to that user id.
            var client = await _userRepository.GetByIdAsync(clientId);

            if (client == null)
                throw new NotFoundException("Client not found.");

            // Request DTOs use strings because they come from JSON. The domain
            // uses enums so only known categories/subjects can be stored.
            if (!TicketRules.TryParseCategory(request.Category, out var category))
                throw new BadRequestException("Invalid ticket category.");

            if (!TicketRules.TryParseSubject(request.Subject, out var subject))
                throw new BadRequestException("Invalid ticket subject.");

            // Ticket.Create centralizes default status/timestamps.
            var ticket = Ticket.Create(
                clientId,
                request.Title,
                category,
                subject,
                DateTime.UtcNow);

            // The mentor's ticket concept treats the ticket as the whole
            // conversation. The create form's description is therefore saved as
            // the first message from the client, not as a field on Ticket.
            ticket.AddMessage(
                clientId,
                request.InitialMessage,
                moveToInProgress: false,
                ticket.CreatedAt);

            // Adding the ticket also saves the initial message because it is in
            // the ticket's Messages collection.
            await _ticketRepository.AddAsync(ticket);
            await _ticketRepository.SaveChangesAsync();

            // Structured logging stores TicketId and ClientId as fields, which
            // is easier to filter than one long concatenated string.
            _logger.LogInformation(
                "Ticket {TicketId} created by client {ClientId}.",
                ticket.Id,
                clientId);

            await _emailService.SendTicketCreatedEmailAsync(
                "support@forcebit.be",
                ticket.Title);

            return MapToTicketDetailResponse(ticket);
        }

        public async Task UpdateTicketStatusAsync(
            Guid ticketId,
            Guid currentUserId,
            string currentUserRole,
            UpdateTicketStatusRequest request)
        {
            var ticket = await _ticketRepository.GetDetailByIdAsync(ticketId);

            if (ticket == null)
                throw new NotFoundException("Ticket not found.");

            if (!UserRoleRules.TryParse(currentUserRole, out var role))
                throw new ForbiddenException("Invalid user role.");

            if (!TicketRules.TryParseStatus(request.Status, out var status))
                throw new BadRequestException("Invalid ticket status.");

            // Status permissions are domain rules: admins can manage the whole
            // workflow, while clients can only close/reopen their own tickets.
            if (!TicketRules.CanChangeStatus(ticket, currentUserId, role, status))
                throw new ForbiddenException("You are not allowed to set this ticket status.");

            // ChangeStatus also keeps ClosedAt consistent with the status.
            ticket.ChangeStatus(status, DateTime.UtcNow);

            // The repository tracks the loaded entity, so changing the entity
            // property and saving is enough for EF Core to update the row.
            await _ticketRepository.SaveChangesAsync();

            _logger.LogInformation(
                "Ticket {TicketId} status changed to {Status} by user {UserId}.",
                ticket.Id,
                ticket.Status,
                currentUserId);

            if (ticket.Client != null && ticket.Status == TicketStatus.Closed)
            {
                // Email is still a service dependency even while the current
                // implementation is a placeholder/logging service.
                await _emailService.SendTicketClosedEmailAsync(
                    ticket.Client.Email,
                    ticket.Title);
            }
        }

        public async Task<TicketMessageResponse> AddMessageAsync(
            Guid ticketId,
            Guid senderId,
            string senderRole,
            CreateTicketMessageRequest request)
        {
            var ticket = await _ticketRepository.GetDetailByIdAsync(ticketId);

            if (ticket == null)
                throw new NotFoundException("Ticket not found.");

            if (!UserRoleRules.TryParse(senderRole, out var role))
                throw new ForbiddenException("Invalid user role.");

            if (!TicketRules.CanAccess(ticket, senderId, role))
                throw new ForbiddenException("You are not allowed to reply to this ticket.");

            // CanReply repeats the access idea and adds status rules. It is
            // separate from CanAccess because reading a closed ticket is allowed
            // while replying to it is not.
            if (!TicketRules.CanReply(ticket, senderId, role))
                throw new BadRequestException("You cannot reply to a closed ticket.");

            // Load sender data so the response can include display information
            // such as name and role.
            var sender = await _userRepository.GetByIdAsync(senderId);

            if (sender == null)
                throw new NotFoundException("Sender not found.");

            // Domain behavior: when an admin replies to an open ticket, the
            // ticket automatically becomes InProgress.
            var message = ticket.AddMessage(
                senderId,
                request.Message,
                TicketRules.ShouldMoveToInProgress(ticket, role),
                DateTime.UtcNow);

            await _ticketRepository.AddMessageAsync(message);
            await _ticketRepository.SaveChangesAsync();

            _logger.LogInformation(
                "Message {MessageId} added to ticket {TicketId} by user {SenderId}.",
                message.Id,
                ticketId,
                senderId);

            if (role == UserRole.Admin && ticket.Client != null)
            {
                // Admin replies notify the client.
                await _emailService.SendTicketReplyEmailAsync(
                    ticket.Client.Email,
                    ticket.Title);
            }
            else
            {
                // Client replies notify support.
                await _emailService.SendTicketReplyEmailAsync(
                    "support@forcebit.be",
                    ticket.Title);
            }

            return new TicketMessageResponse
            {
                Id = message.Id,
                TicketId = message.TicketId,
                SenderId = sender.Id,
                SenderName = sender.Name,
                SenderRole = sender.Role.ToString(),
                Message = message.Message,
                CreatedAt = message.CreatedAt
            };
        }

        private static TicketListItemResponse MapToTicketListItemResponse(Ticket ticket)
        {
            // DTO mapping keeps EF/domain entities from leaking directly to the
            // frontend. That gives us freedom to change database/domain shape
            // without forcing the API contract to change.
            return new TicketListItemResponse
            {
                Id = ticket.Id,
                ClientId = ticket.ClientId,
                ClientName = ticket.Client?.Name ?? "",
                CompanyName = ticket.Client?.CompanyName ?? "",
                Title = ticket.Title,
                Category = ticket.Category.ToString(),
                Subject = ticket.Subject.ToString(),
                Status = ticket.Status.ToString(),
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt
            };
        }

        private static TicketDetailResponse MapToTicketDetailResponse(Ticket ticket)
        {
            // The detail response is intentionally bigger than the list item:
            // it includes conversation messages and attachment metadata.
            return new TicketDetailResponse
            {
                Id = ticket.Id,
                ClientId = ticket.ClientId,
                ClientName = ticket.Client?.Name ?? "",
                CompanyName = ticket.Client?.CompanyName ?? "",
                Title = ticket.Title,
                Category = ticket.Category.ToString(),
                Subject = ticket.Subject.ToString(),
                Status = ticket.Status.ToString(),
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt,
                ClosedAt = ticket.ClosedAt,

                // Nested mapping shapes the conversation exactly how the
                // frontend needs it, without exposing EF navigation objects.
                Messages = ticket.Messages
                    // The first item is the original description/initial client
                    // message. Ordering keeps the conversation chronological.
                    .OrderBy(m => m.CreatedAt)
                    .Select(m => new TicketMessageResponse
                    {
                        Id = m.Id,
                        TicketId = m.TicketId,
                        SenderId = m.SenderId,
                        SenderName = m.Sender?.Name ?? "",
                        SenderRole = m.Sender?.Role.ToString() ?? "",
                        Message = m.Message,
                        CreatedAt = m.CreatedAt,
                        Attachments = m.Attachments.Select(a => new AttachmentResponse
                        {
                            Id = a.Id,
                            TicketId = a.TicketId,
                            MessageId = a.MessageId,
                            FileName = a.FileName,
                            FileUrl = a.FilePath,
                            ContentType = a.ContentType,
                            UploadedAt = a.UploadedAt
                        }).ToList()
                    }).ToList(),

                // Ticket-level attachments have no MessageId. Message-level
                // attachments are mapped inside each message above.
                Attachments = ticket.Attachments
                    .Where(a => a.MessageId == null)
                    .Select(a => new AttachmentResponse
                    {
                        Id = a.Id,
                        TicketId = a.TicketId,
                        MessageId = a.MessageId,
                        FileName = a.FileName,
                        FileUrl = a.FilePath,
                        ContentType = a.ContentType,
                        UploadedAt = a.UploadedAt
                    }).ToList()
            };
        }
    }
}
