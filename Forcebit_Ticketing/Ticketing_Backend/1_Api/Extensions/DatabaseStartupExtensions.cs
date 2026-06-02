using Microsoft.EntityFrameworkCore;

using Persistence.Data;

namespace Api.Extensions;

public static class DatabaseStartupExtensions
{
    public static async Task EnsureDatabaseIsAvailableAsync(this WebApplication app)
    {
        // This app needs the database for authentication, tickets and replies.
        // Failing fast gives a clear terminal error instead of letting the API
        // start and then fail during the first real request.
        using var scope = app.Services.CreateScope();

        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
            .CreateLogger("DatabaseStartup");

        try
        {
            if (await dbContext.Database.CanConnectAsync())
            {
                logger.LogInformation("Database connection verified.");
                return;
            }
        }
        catch (Exception exception)
        {
            throw new InvalidOperationException(
                "The backend cannot connect to the MySQL database. Start the MySQL service and verify the DefaultConnection setting.",
                exception);
        }

        throw new InvalidOperationException(
            "The backend cannot connect to the MySQL database. Start the MySQL service and verify the DefaultConnection setting.");
    }
}
