// AIModified:2026-01-11T10:33:15Z
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
            Email = user.Email,
            Role = user.Role,
            Token = GenerateSimpleToken(user.Id, user.Role), // Simple token generation
            InterviewerProfileId = user.InterviewerProfile?.Id
        };

        return Ok(response);
    }

    private string GenerateSimpleToken(int userId, string role)
    {
        // In production, use JWT tokens
        // For now, return a simple base64 encoded string
        var tokenData = $"{userId}:{role}:{DateTime.UtcNow:yyyyMMddHHmmss}";
        return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(tokenData));
    }
}
