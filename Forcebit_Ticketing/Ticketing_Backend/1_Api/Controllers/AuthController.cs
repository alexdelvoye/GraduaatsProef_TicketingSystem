using Microsoft.AspNetCore.Mvc;

using Services.DTOs.Auth;
using Services.DTOs.Common;
using Services.Interfaces;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    // Auth endpoints stay anonymous because users do not have a token yet when
    // they register or log in.
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            // The controller delegates the workflow to the service. That keeps
            // HTTP routing separate from registration logic.
            var result = await _authService.RegisterAsync(request);

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);

            if (result == null)
            {
                // Login returns null for invalid credentials. The controller is
                // the right place to translate that into an HTTP 401 response.
                return Unauthorized(new ErrorResponse
                {
                    StatusCode = StatusCodes.Status401Unauthorized,
                    Message = "Invalid email or password."
                });
            }

            // Successful login returns the JWT and user information in one
            // response so the frontend can store both.
            return Ok(result);
        }
    }
}
