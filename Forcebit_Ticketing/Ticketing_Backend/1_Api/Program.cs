using System.Diagnostics;
using System.Text;
using System.Text.Json;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

using Api.Extensions;
using Api.Middleware;
using Services.DTOs.Common;
using Services.Options;

var builder = WebApplication.CreateBuilder(args);

// Logging is configured explicitly instead of accepting every default provider.
// This avoids Windows Event Log permission problems on local machines and keeps
// console output readable during demos.
builder.Logging.ClearProviders();
builder.Logging.AddSimpleConsole(options =>
{
    options.IncludeScopes = true;
    options.TimestampFormat = "yyyy-MM-dd HH:mm:ss ";
});
builder.Logging.AddDebug();

var jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);

// Controllers are the HTTP entry points. The custom ApiBehaviorOptions below
// makes validation errors use the same JSON shape as our exception middleware,
// so the frontend can handle API errors in one predictable way.
builder.Services.AddControllers();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(item => item.Value?.Errors.Count > 0)
            .ToDictionary(
                item => item.Key,
                item => item.Value?.Errors
                    .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage)
                        ? "The value is invalid."
                        : error.ErrorMessage)
                    .ToArray() ?? []);

        return new BadRequestObjectResult(new ErrorResponse
        {
            StatusCode = StatusCodes.Status400BadRequest,
            Message = "Please check the highlighted fields and try again.",
            TraceId = Activity.Current?.Id ?? context.HttpContext.TraceIdentifier,
            Errors = errors
        });
    };
});

// Swagger/OpenAPI is used for manual API testing and documentation.
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS allows the React Native/web frontend to call the local API.
// For a production app this should be restricted to known frontend origins.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Options pattern:
// appsettings.json is bound to strongly typed classes and validated at startup.
// This gives early, readable failures for missing/invalid configuration.
builder.Services.AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection("Jwt"))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddOptions<EmailOptions>()
    .Bind(builder.Configuration.GetSection("Email"))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddOptions<FileStorageOptions>()
    .Bind(builder.Configuration.GetSection("FileStorage"))
    .ValidateDataAnnotations()
    .Validate(options => options.AllowedExtensions.All(extension => extension.StartsWith('.')),
        "Allowed file extensions must start with a dot.")
    .ValidateOnStart();

// API owns dependency injection composition. The implementations stay in their
// own layers: Services for use cases and Persistence for database access.
builder.Services.AddApplicationServices();
builder.Services.AddPersistenceServices(builder.Configuration);

// JWT authentication keeps the backend stateless. The frontend stores the token
// and sends it in the Authorization header for protected requests.
var jwtOptions = builder.Configuration
    .GetSection("Jwt")
    .Get<JwtOptions>();

if (jwtOptions == null || string.IsNullOrWhiteSpace(jwtOptions.Key))
{
    throw new InvalidOperationException("JWT key is missing in appsettings.json");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtOptions.Key))
        };

        // Return JSON for auth errors instead of the default empty responses.
        options.Events = new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";

                var response = new ErrorResponse
                {
                    StatusCode = StatusCodes.Status401Unauthorized,
                    Message = "You need to log in to continue.",
                    TraceId = Activity.Current?.Id ?? context.HttpContext.TraceIdentifier
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
            },
            OnForbidden = async context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";

                var response = new ErrorResponse
                {
                    StatusCode = StatusCodes.Status403Forbidden,
                    Message = "You do not have permission to perform this action.",
                    TraceId = Activity.Current?.Id ?? context.HttpContext.TraceIdentifier
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Development convenience: create a known admin account for testing/demo use.
await app.SeedAdminUserAsync();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// Middleware order matters:
// exception handling wraps the request, authentication fills User claims,
// request logging can then include the user id, and authorization checks roles.
app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseAuthorization();

// This API does not need static files. Only enable them if a wwwroot folder is
// present, which avoids noisy warnings during normal development.
var webRootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");

if (Directory.Exists(webRootPath))
{
    app.UseStaticFiles();
}

app.MapControllers();

app.Run();
