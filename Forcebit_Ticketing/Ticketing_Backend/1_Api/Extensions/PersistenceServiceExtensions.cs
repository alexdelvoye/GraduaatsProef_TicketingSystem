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

        ServerVersion serverVersion;

        try
        {
            // AutoDetect opens a connection so Pomelo can use the correct MySQL
            // dialect. Wrapping it gives developers a clear startup error when
            // MySQL is stopped or the connection string is wrong.
            serverVersion = ServerVersion.AutoDetect(connectionString);
        }
        catch (Exception exception)
        {
            throw new InvalidOperationException(
                "Could not connect to the MySQL database. Start MySQL and check the DefaultConnection value in appsettings.json.",
                exception);
        }

        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseMySql(
                connectionString,
                serverVersion
            );
        });

        // Repositories are the persistence boundary used by services.
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITicketRepository, TicketRepository>();
        services.AddScoped<IAttachmentRepository, AttachmentRepository>();

        return services;
    }
}
