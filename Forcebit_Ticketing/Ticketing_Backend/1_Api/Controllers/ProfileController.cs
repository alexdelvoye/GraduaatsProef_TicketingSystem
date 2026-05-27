using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Services.DTOs.Users;
using Services.Interfaces;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/profile")]
    [Authorize]
    // Profile endpoints are for the currently authenticated user. They are
    // separate from AuthController because the user already has a token here.
    public class ProfileController : ApiControllerBase
    {
        private readonly IUserService _userService;

        public ProfileController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPut]
        public async Task<ActionResult<UserResponse>> UpdateProfile(
            UpdateProfileRequest request)
        {
            // CurrentUserId comes from the JWT. The request may edit name/email,
            // but cannot choose which account to update.
            var updatedUser = await _userService.UpdateProfileAsync(
                CurrentUserId,
                request);

            return Ok(updatedUser);
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteProfile()
        {
            // Account removal always uses the id from the token. The frontend
            // cannot choose another user id, which protects other accounts.
            await _userService.DeleteProfileAsync(CurrentUserId);

            return NoContent();
        }
    }
}
