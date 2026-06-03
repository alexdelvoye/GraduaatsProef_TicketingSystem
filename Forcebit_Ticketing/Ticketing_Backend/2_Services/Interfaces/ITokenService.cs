using Domain.Entities;

namespace Services.Interfaces
{
    // Token creation is separated from AuthService so authentication decisions
    // and JWT formatting/signing can change independently.
    public interface ITokenService
    {
        // Creates the compact JWT string sent to the frontend after login or
        // registration.
        string CreateToken(User user);
    }
}
