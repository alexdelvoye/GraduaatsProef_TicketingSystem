using Services.Interfaces;
using Services.Services;

namespace Api.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Scoped lifetime means one service instance per HTTP request. That fits
        // services that use repositories/DbContext.
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITicketService, TicketService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAttachmentService, AttachmentService>();

        // Utility services are still registered behind interfaces so the app can
        // swap implementations later without changing the controllers/services.
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IFileStorageService, LocalFileStorageService>();

        // EmailService calls Brevo's transactional HTTP API. AddHttpClient
        // injects a managed HttpClient so we reuse connections instead of
        // creating sockets manually for every notification.
        services.AddHttpClient<IEmailService, EmailService>();

        return services;
    }
}
