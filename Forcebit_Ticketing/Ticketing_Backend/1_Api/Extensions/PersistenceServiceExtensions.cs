using Microsoft.EntityFrameworkCore;

using Persistence.Data;
using Persistence.Repositories;

using Services.Interfaces;

namespace Api.Extensions;

public static class PersistenceServiceExtensions
{
    public static IServiceCollection AddPersistenceServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            // Fail fast: without a database connection the backend cannot work.
            throw new InvalidOperationException("DefaultConnection is missing in appsettings.json");
        }

        services.AddDbContext<AppDbContext>(options =>
        {
            // AutoDetect reads the MySQL server version from the connection so
            // Pomelo can generate compatible SQL.
            options.UseMySql(
                connectionString,
                ServerVersion.AutoDetect(connectionString)
            );
        });

        // Repositories are the persistence boundary used by services.
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITicketRepository, TicketRepository>();
        services.AddScoped<IAttachmentRepository, AttachmentRepository>();

        return services;
    }
}
