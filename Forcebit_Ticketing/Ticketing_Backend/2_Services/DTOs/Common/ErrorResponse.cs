namespace Services.DTOs.Common
{
    // Standard error body returned by exception middleware and auth failures.
    // A consistent shape makes frontend error handling much simpler.
    public class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Details { get; set; }
        public string? TraceId { get; set; }
        public Dictionary<string, string[]>? Errors { get; set; }
    }
}
