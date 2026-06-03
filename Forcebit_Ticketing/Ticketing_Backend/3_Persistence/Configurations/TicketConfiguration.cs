using Domain.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations
{
    // Database mapping for tickets and their relationship to the client user.
    public class TicketConfiguration : IEntityTypeConfiguration<Ticket>
    {
        public void Configure(EntityTypeBuilder<Ticket> builder)
        {
            builder.HasKey(t => t.Id);

            builder.Property(t => t.Title)
                .IsRequired()
                .HasMaxLength(150);

            // HasConversion<string>() stores enum names such as "TechnicalProblem"
            // and "Open" instead of numbers. That makes database rows readable
            // during debugging and demos.
            builder.Property(t => t.Category)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(t => t.Subject)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(t => t.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.HasOne(t => t.Client)
                .WithMany(u => u.Tickets)
                .HasForeignKey(t => t.ClientId)
                // Restrict prevents deleting a user while tickets still point
                // to that user, preserving ticket history.
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
