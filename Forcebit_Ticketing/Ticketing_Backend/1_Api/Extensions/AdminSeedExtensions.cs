using Domain.Entities;
using Domain.Enums;

using Microsoft.EntityFrameworkCore;

using Persistence.Data;

namespace Api.Extensions;

public static class AdminSeedExtensions
{
    public static async Task SeedAdminUserAsync(this WebApplication app)
    {
        // Create a scope because DbContext is registered as scoped. Startup code
        // itself does not automatically run inside a request scope.
        using var scope = app.Services.CreateScope();

        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
            .CreateLogger("AdminSeed");

        // Keep seed credentials in configuration so they can be changed without
        // editing compiled code.
        var email = configuration["AdminUser:Email"]?.Trim().ToLowerInvariant();
        var password = configuration["AdminUser:Password"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            // Missing seed settings should not crash development startup.
            return;
        }

        try
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var existingUser = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (existingUser != null)
            {
                if (existingUser.Role != UserRole.Admin)
                {
                    // If the configured seed email already exists, promote it
                    // rather than creating a duplicate user.
                    existingUser.Role = UserRole.Admin;
                    await dbContext.SaveChangesAsync();
                }

                return;
            }

            dbContext.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Name = configuration["AdminUser:Name"] ?? "Forcebit Admin",
                CompanyName = configuration["AdminUser:CompanyName"] ?? "Forcebit",
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow
            });

            await dbContext.SaveChangesAsync();
        }
        catch (Exception exception)
        {
            // Seeding is helpful for development, but the log message gives a
            // clear clue if the database is unavailable during startup.
            logger.LogWarning(
                exception,
                "Admin user could not be seeded. Check the database connection and migrations.");
        }
    }
}
