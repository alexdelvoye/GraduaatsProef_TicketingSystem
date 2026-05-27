using Domain.Enums;

namespace Domain.Rules;

// Role parsing lives in the domain layer because roles are part of the business
// language. It avoids repeating string parsing rules in multiple services.
public static class UserRoleRules
{
    public static bool TryParse(string value, out UserRole role)
    {
        return Enum.TryParse(value.Replace(" ", string.Empty), true, out role);
    }
}
