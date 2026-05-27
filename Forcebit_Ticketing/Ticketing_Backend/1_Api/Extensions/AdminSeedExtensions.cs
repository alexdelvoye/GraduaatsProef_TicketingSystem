using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Persistence.Data;

namespace Api.Extensions;

public static class AdminSeedExtensions
{
    public static async Task SeedAdminUserAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
            .CreateLogger("AdminSeed");

        var email = configuration["AdminUser:Email"]?.Trim().ToLowerInvariant();
        var password = configuration["AdminUser:Password"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
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
            logger.LogWarning(
                exception,
                "Admin user could not be seeded. Check the database connection and migrations.");
        }
    }
}
