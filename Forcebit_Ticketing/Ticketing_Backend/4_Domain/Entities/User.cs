using Domain.Common;
using Domain.Enums;

namespace Domain.Entities
{
    public class User : BaseEntity
    {
        public string Name { get; set; } = string.Empty;

        public string CompanyName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public UserRole Role { get; set; }

        public DateTime CreatedAt { get; set; }

        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();

        public ICollection<TicketMessage> Messages { get; set; } = new List<TicketMessage>();

        public ICollection<TicketAttachment> Attachments { get; set; } = new List<TicketAttachment>();

        // Factory method for normal client registration. Admin creation is done
        // separately by the seed extension, because it is application startup
        // behavior rather than normal user self-registration.
        public static User CreateClient(
            string name,
            string companyName,
            string email,
            string passwordHash,
            DateTime createdAt)
        {
            return new User
            {
                Id = Guid.NewGuid(),
                Name = name.Trim(),
                CompanyName = companyName.Trim(),
                Email = email.Trim().ToLowerInvariant(),
                PasswordHash = passwordHash,
                Role = UserRole.Client,
                CreatedAt = createdAt
            };
        }
    }
}
