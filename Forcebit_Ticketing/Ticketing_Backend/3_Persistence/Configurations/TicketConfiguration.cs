using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations
{
    public class TicketConfiguration : IEntityTypeConfiguration<Ticket>
    {
        public void Configure(EntityTypeBuilder<Ticket> builder)
        {
            builder.HasKey(t => t.Id);

            builder.Property(t => t.Title)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(t => t.Category)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(t => t.Subject)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(t => t.Description)
                .IsRequired()
                .HasMaxLength(3000);

            builder.Property(t => t.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.HasOne(t => t.Client)
                .WithMany(u => u.Tickets)
                .HasForeignKey(t => t.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
