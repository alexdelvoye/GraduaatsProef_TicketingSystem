
namespace Services.DTOs.Common
{
    public class ApiResponseT<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
    }
}
