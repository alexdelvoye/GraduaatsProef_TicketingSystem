
namespace Services.Options
{
    public class JwtOptions
    {
        public string Key { get; set; } = string.Empty;
        public int ExpirationDays { get; set; } = 7;
    }
}
