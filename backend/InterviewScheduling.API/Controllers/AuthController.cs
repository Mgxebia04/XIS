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
        // Look up user by email only - role is determined from the user table
        var user = await _context.Users
            .Include(u => u.InterviewerProfile)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        // In production, verify password hash
        // For now, we'll accept any password for seeded users
        // var isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        // if (!isValidPassword) return Unauthorized(new { message = "Invalid email or password" });

        // Role is determined from the user table, not from the request
        var response = new LoginResponse
        {
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role,
            Token = GenerateSimpleToken(user.Id, user.Role), // Simple token generation
            InterviewerProfileId = user.InterviewerProfile?.Id
        };

        return Ok(response);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User not authenticated" });
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Validate current password
        // In production, verify password hash
        // For now, we'll accept any password for demo purposes
        // var isValidPassword = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
        // if (!isValidPassword)
        // {
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

        return Ok(new { message = "Password changed successfully" });
    }

    private int? GetCurrentUserId()
    {
        // Extract user ID from token/claims
        var authHeader = Request.Headers["Authorization"].ToString();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            return null;

        try
        {
            var token = authHeader.Substring(7);
            var tokenData = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(token));
            var parts = tokenData.Split(':');
            if (parts.Length > 0 && int.TryParse(parts[0], out var userId))
                return userId;
        }
        catch { }

        return null;
    }

    private string GenerateSimpleToken(int userId, string role)
    {
        // In production, use JWT tokens
        // For now, return a simple base64 encoded string
        var tokenData = $"{userId}:{role}:{DateTime.UtcNow:yyyyMMddHHmmss}";
        return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(tokenData));
    }
}
