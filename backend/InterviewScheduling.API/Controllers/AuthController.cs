// AIModified:2026-01-11T05:42:58Z
using Microsoft.AspNetCore.Mvc;
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
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.InterviewerProfile)
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.Role == request.Role);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or role" });
        }

        // In production, verify password hash
        // For now, we'll accept any password for seeded users
        // var isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        // if (!isValidPassword) return Unauthorized();

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
