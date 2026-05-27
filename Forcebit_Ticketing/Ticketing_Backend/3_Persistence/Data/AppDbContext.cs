using Domain.Entities;

using Microsoft.EntityFrameworkCore;

namespace Persistence.Data
{
    // EF Core database context. It represents the database session and exposes
    // DbSet properties for each aggregate/table the application stores.
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        // DbSet<T> is the EF Core entry point for querying and saving each table.
        public DbSet<User> Users => Set<User>();
        public DbSet<Ticket> Tickets => Set<Ticket>();
        public DbSet<TicketMessage> TicketMessages => Set<TicketMessage>();
        public DbSet<TicketAttachment> TicketAttachments => Set<TicketAttachment>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Automatically loads IEntityTypeConfiguration classes from the
            // Persistence assembly, keeping table configuration out of DbContext.
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
    }
}
