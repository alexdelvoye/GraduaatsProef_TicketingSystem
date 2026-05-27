using System.Security.Claims;

using Microsoft.AspNetCore.Mvc;

using Services.Exceptions;

namespace Api.Controllers;

// Shared base class for authenticated API controllers.
// Without this class every controller would need to repeat the same JWT claim
// parsing code. Keeping it here follows SRP: controllers handle endpoints,
// while this base class handles "who is the current user?" plumbing.
public abstract class ApiControllerBase : ControllerBase
{
    // The NameIdentifier claim is written in TokenService when a JWT is created.
    // If it is missing or malformed, we throw an application exception so the
    // exception middleware can return the normal JSON error response.
    protected Guid CurrentUserId
    {
        get
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!Guid.TryParse(userId, out var parsedUserId))
                throw new UnauthorizedException("Invalid authentication token.");

            return parsedUserId;
        }
    }

    // Services need the role as normal data to apply business rules.
    // They should not depend on ControllerBase, HttpContext, or JWT details.
    protected string CurrentUserRole
    {
        get
        {
            return User.FindFirstValue(ClaimTypes.Role)
                ?? throw new UnauthorizedException("Invalid authentication token.");
        }
    }
}
