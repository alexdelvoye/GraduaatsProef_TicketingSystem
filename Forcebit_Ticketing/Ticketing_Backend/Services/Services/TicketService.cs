using Domain.Entities;
using Domain.Enums;
using Services.DTOs.Attachments;
using Services.DTOs.Messages;
using Services.DTOs.Tickets;
using Services.Interfaces;

namespace Services.Services
{
    public class TicketService : ITicketService
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;

        public TicketService(
            ITicketRepository ticketRepository,
            IUserRepository userRepository,
            IEmailService emailService)
        {
            _ticketRepository = ticketRepository;
            _userRepository = userRepository;
            _emailService = emailService;
        }

        public async Task<List<TicketListItemResponse>> GetTicketsForClientAsync(Guid clientId)
        {
            var tickets = await _ticketRepository.GetTicketsByClientIdAsync(clientId);

            return tickets.Select(t => new TicketListItemResponse
            {
                Id = t.Id,
                Title = t.Title,
                Category = t.Category.ToString(),
                Subject = t.Subject.ToString(),
                Status = t.Status.ToString(),
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            }).ToList();
        }

        public async Task<List<TicketListItemResponse>> GetAllTicketsAsync()
        {
            var tickets = await _ticketRepository.GetAllTicketsAsync();

            return tickets.Select(t => new TicketListItemResponse
            {
                Id = t.Id,
                Title = t.Title,
                Category = t.Category.ToString(),
                Subject = t.Subject.ToString(),
                Status = t.Status.ToString(),
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            }).ToList();
        }

        public async Task<TicketDetailResponse> GetTicketByIdAsync(
            Guid ticketId,
            Guid currentUserId,
            string currentUserRole)
        {
            var ticket = await _ticketRepository.GetDetailByIdAsync(ticketId);

            if (ticket == null)
                throw new Exception("Ticket not found.");

            if (currentUserRole == "Client" && ticket.ClientId != currentUserId)
                throw new Exception("You are not allowed to view this ticket.");

            return MapToTicketDetailResponse(ticket);
        }

        public async Task<TicketDetailResponse> CreateTicketAsync(
            Guid clientId,
            CreateTicketRequest request)
        {
            var client = await _userRepository.GetByIdAsync(clientId);

            if (client == null)
                throw new Exception("Client not found.");

            var ticket = new Ticket
            {
                Id = Guid.NewGuid(),
                ClientId = clientId,
                Title = request.Title,
                Category = Enum.Parse<TicketCategory>(request.Category),
                Subject = Enum.Parse<TicketSubject>(request.Subject),
                Description = request.Description,
                Status = TicketStatus.Open,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _ticketRepository.AddAsync(ticket);
            await _ticketRepository.SaveChangesAsync();

            await _emailService.SendTicketCreatedEmailAsync(
                "support@forcebit.be",
                ticket.Title);

            return MapToTicketDetailResponse(ticket);
        }

        public async Task UpdateTicketStatusAsync(
            Guid ticketId,
            UpdateTicketStatusRequest request)
        {
            var ticket = await _ticketRepository.GetDetailByIdAsync(ticketId);

            if (ticket == null)
                throw new Exception("Ticket not found.");

            ticket.Status = Enum.Parse<TicketStatus>(request.Status);
            ticket.UpdatedAt = DateTime.UtcNow;

            if (ticket.Status == TicketStatus.Closed)
                ticket.ClosedAt = DateTime.UtcNow;

            await _ticketRepository.SaveChangesAsync();

            if (ticket.Client != null && ticket.Status == TicketStatus.Closed)
            {
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
                throw new Exception("Ticket not found.");

            if (senderRole == "Client" && ticket.ClientId != senderId)
                throw new Exception("You are not allowed to reply to this ticket.");

            if (ticket.Status == TicketStatus.Closed)
                throw new Exception("You cannot reply to a closed ticket.");

            var sender = await _userRepository.GetByIdAsync(senderId);

            if (sender == null)
                throw new Exception("Sender not found.");

            var message = new TicketMessage
            {
                Id = Guid.NewGuid(),
                TicketId = ticketId,
                SenderId = senderId,
                Message = request.Message,
                CreatedAt = DateTime.UtcNow
            };

            await _ticketRepository.AddMessageAsync(message);

            ticket.UpdatedAt = DateTime.UtcNow;

            if (ticket.Status == TicketStatus.Open && senderRole == "Admin")
                ticket.Status = TicketStatus.InProgress;

            await _ticketRepository.SaveChangesAsync();

            if (senderRole == "Admin" && ticket.Client != null)
            {
                await _emailService.SendTicketReplyEmailAsync(
                    ticket.Client.Email,
                    ticket.Title);
            }
            else
            {
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

        private static TicketDetailResponse MapToTicketDetailResponse(Ticket ticket)
        {
            return new TicketDetailResponse
            {
                Id = ticket.Id,
                ClientId = ticket.ClientId,
                ClientName = ticket.Client?.Name ?? "",
                CompanyName = ticket.Client?.CompanyName ?? "",
                Title = ticket.Title,
                Category = ticket.Category.ToString(),
                Subject = ticket.Subject.ToString(),
                Description = ticket.Description,
                Status = ticket.Status.ToString(),
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt,
                ClosedAt = ticket.ClosedAt,

                Messages = ticket.Messages.Select(m => new TicketMessageResponse
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
