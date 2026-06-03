using Domain.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations
{
    // Database mapping for ticket conversation messages.
    public class TicketMessageConfiguration : IEntityTypeConfiguration<TicketMessage>
    {
        public void Configure(EntityTypeBuilder<TicketMessage> builder)
        {
            builder.HasKey(m => m.Id);

            builder.Property(m => m.Message)
                .IsRequired()
                .HasMaxLength(3000);

            builder.HasOne(m => m.Ticket)
                .WithMany(t => t.Messages)
                .HasForeignKey(m => m.TicketId)
                // Deleting a ticket deletes its messages because messages do not
                // make sense without the ticket.
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(m => m.Sender)
                .WithMany(u => u.Messages)
                .HasForeignKey(m => m.SenderId)
                // Do not delete messages just because a sender row would be
                // deleted. Ticket history should stay tied to the ticket.
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
