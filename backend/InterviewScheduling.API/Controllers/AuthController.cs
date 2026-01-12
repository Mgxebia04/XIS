// AIModified:2026-01-11T16:22:15Z
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using InterviewScheduling.API.Data;
using InterviewScheduling.API.DTOs;
using BCrypt.Net;

namespace InterviewScheduling.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AuthController> _logger;

    public AuthController(ApplicationDbContext context, ILogger<AuthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid request data", errors = ModelState });
            }

            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            var user = await _context.Users
                .Include(u => u.InterviewerProfile)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                _logger.LogWarning("Login attempt with invalid email: {Email}", request.Email);
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Note: Password verification is disabled for demo purposes
            // In production, uncomment the following lines:
            // var isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            // if (!isValidPassword)
            // {
            //     _logger.LogWarning("Login attempt with invalid password for user: {Email}", request.Email);
            //     return Unauthorized(new { message = "Invalid email or password" });
            // }

            var response = new LoginResponse
            {
                UserId = user.Id,
                Email = user.Email,
                Role = user.Role,
                Token = GenerateSimpleToken(user.Id, user.Role),
                InterviewerProfileId = user.InterviewerProfile?.Id
            };

            _logger.LogInformation("User logged in successfully: {Email}", user.Email);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email: {Email}", request?.Email);
            return StatusCode(500, new { message = "An error occurred during login. Please try again later." });
        }
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid request data", errors = ModelState });
            }

            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("Password change attempted for non-existent user ID: {UserId}", userId);
                return NotFound(new { message = "User not found" });
            }

            // Note: Current password verification is disabled for demo purposes
            // In production, uncomment the following lines:
            // var isValidPassword = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
            // if (!isValidPassword)
            // {
            //     _logger.LogWarning("Password change failed: incorrect current password for user: {Email}", user.Email);
            //     return BadRequest(new { message = "Current password is incorrect" });
            // }

            // Validate new password
            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "New password must be at least 6 characters long" });
            }

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Password changed successfully for user: {Email}", user.Email);
            return Ok(new { message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user ID: {UserId}", GetCurrentUserId());
            return StatusCode(500, new { message = "An error occurred while changing password. Please try again later." });
        }
    }

    private int? GetCurrentUserId()
    {
        return InterviewScheduling.API.Helpers.AuthorizationHelper.GetCurrentUserId(this);
    }

    private string GenerateSimpleToken(int userId, string role)
    {
        // Note: Using simple token for demo. In production, use JWT tokens
        var tokenData = $"{userId}:{role}:{DateTime.UtcNow:yyyyMMddHHmmss}";
        return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(tokenData));
    }
}
