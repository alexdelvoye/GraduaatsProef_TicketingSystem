using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using Domain.Entities;

using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

using Services.Interfaces;
using Services.Options;

namespace Services.Services
{
    // Responsible only for creating JWT tokens. AuthService decides whether a
    // user may log in; TokenService turns a valid user into a signed token.
    public class TokenService : ITokenService
    {
        private readonly JwtOptions _jwtOptions;

        public TokenService(IOptions<JwtOptions> jwtOptions)
        {
            _jwtOptions = jwtOptions.Value;
        }

        public string CreateToken(User user)
        {
            if (string.IsNullOrWhiteSpace(_jwtOptions.Key))
                throw new InvalidOperationException("JWT configuration error: key is missing.");

            // Claims are facts about the user stored inside the token. The API
            // later reads these claims to know who is making the request.
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            // The same secret key must be used for signing here and validation
            // in Program.cs.
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_jwtOptions.Key));

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(_jwtOptions.ExpirationDays),
                signingCredentials: credentials);

            // Serialize the JwtSecurityToken object into the compact string sent
            // to the frontend.
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
