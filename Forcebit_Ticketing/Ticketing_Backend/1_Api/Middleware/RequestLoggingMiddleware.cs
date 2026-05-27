using System.Diagnostics;
using System.Security.Claims;

namespace Api.Middleware;

// Middleware runs once for every HTTP request.
// This class has one responsibility: write request/response log lines with
// enough context to debug issues during development or a demo.
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(
        RequestDelegate next,
        ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anonymous";

        // A logging scope attaches these values to all log lines written during
        // this request. TraceId is especially useful: it also appears in error
        // responses, so a frontend error can be matched with backend logs.
        using var scope = _logger.BeginScope(
            "TraceId:{TraceId} UserId:{UserId} Method:{Method} Path:{Path}",
            Activity.Current?.Id ?? context.TraceIdentifier,
            userId,
            context.Request.Method,
            context.Request.Path.Value);

        _logger.LogInformation(
            "HTTP {Method} {Path} started for user {UserId}.",
            context.Request.Method,
            context.Request.Path,
            userId);

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();

            // 2xx/3xx are normal, 4xx is usually a client/input/auth problem,
            // and 5xx means the server failed. The log level mirrors that.
            var statusCode = context.Response.StatusCode;
            var logLevel = statusCode >= StatusCodes.Status500InternalServerError
                ? LogLevel.Error
                : statusCode >= StatusCodes.Status400BadRequest
                    ? LogLevel.Warning
                    : LogLevel.Information;

            _logger.Log(
                logLevel,
                "HTTP {Method} {Path} completed with {StatusCode} in {ElapsedMilliseconds} ms for user {UserId}.",
                context.Request.Method,
                context.Request.Path,
                statusCode,
                stopwatch.ElapsedMilliseconds,
                userId);
        }
    }
}
