using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using InterviewScheduling.API.Data;
using InterviewScheduling.API.DTOs;
using InterviewScheduling.API.Models;
using BCrypt.Net;

namespace InterviewScheduling.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Require authentication
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AdminController> _logger;

    public AdminController(ApplicationDbContext context, ILogger<AdminController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // Helper method to check if current user is admin
    private async Task<bool> IsAdminAsync()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return false;

        var user = await _context.Users.FindAsync(userId);
        return user?.Role == "Admin";
    }

    private int? GetCurrentUserId()
    {
        // Extract user ID from token/claims
        // For now, using a simple approach - in production, use JWT claims
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

    /// <summary>
    /// Onboard a new HR user
    /// </summary>
    [HttpPost("onboard-hr")]
    public async Task<ActionResult> OnboardHr([FromBody] OnboardHrRequest request)
    {
        if (!await IsAdminAsync())
        {
            return Forbid("Only admins can onboard HR users");
        }

        // Validate input
        if (string.IsNullOrWhiteSpace(request.Name) || 
            string.IsNullOrWhiteSpace(request.Email) || 
            string.IsNullOrWhiteSpace(request.InitialPassword))
        {
            return BadRequest(new { message = "Name, email, and password are required" });
        }

        // Check if email already exists
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            return Conflict(new { message = "User with this email already exists" });
        }

        // Create new HR user
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.InitialPassword);
        var newUser = new User
        {
            Email = request.Email,
            Name = request.Name,
            PasswordHash = passwordHash,
            Role = "HR Manager",
            CreatedAt = DateTime.UtcNow,
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        return Ok(new { 
            message = "HR user onboarded successfully",
            userId = newUser.Id,
            email = newUser.Email
        });
    }

    /// <summary>
    /// Get all pending panel requests
    /// </summary>
    [HttpGet("panel-requests")]
    public async Task<ActionResult<List<PanelRequestDto>>> GetPanelRequests()
    {
        if (!await IsAdminAsync())
        {
            return Forbid("Only admins can view panel requests");
        }

        var requests = await _context.PanelRequests
            .Include(r => r.RequestedByUser)
            .Where(r => r.Status == "PENDING")
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new PanelRequestDto
            {
                Id = r.Id,
                RequestedByUserId = r.RequestedByUserId,
                RequestedByUserName = r.RequestedByUser!.Name ?? r.RequestedByUser.Email,
                RequestedByUserEmail = r.RequestedByUser.Email,
                PanelName = r.PanelName,
                PanelEmail = r.PanelEmail,
                Notes = r.Notes,
                Status = r.Status,
                CreatedAt = r.CreatedAt,
                ProcessedAt = r.ProcessedAt,
            })
            .ToListAsync();

        return Ok(requests);
    }

    /// <summary>
    /// Create a panel member from a pending request
    /// </summary>
    [HttpPost("create-panel")]
    public async Task<ActionResult> CreatePanel([FromBody] CreatePanelRequest request)
    {
        if (!await IsAdminAsync())
        {
            return Forbid("Only admins can create panel members");
        }

        // Find the panel request
        var panelRequest = await _context.PanelRequests
            .Include(r => r.RequestedByUser)
            .FirstOrDefaultAsync(r => r.Id == request.PanelRequestId);

        if (panelRequest == null)
        {
            return NotFound(new { message = "Panel request not found" });
        }

        if (panelRequest.Status != "PENDING")
        {
            return BadRequest(new { message = "Panel request has already been processed" });
        }

        // Check if email already exists
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == panelRequest.PanelEmail);
        if (existingUser != null)
        {
            return Conflict(new { message = "User with this email already exists" });
        }

        var adminUserId = GetCurrentUserId();
        if (adminUserId == null)
        {
            return Unauthorized();
        }

        // Create new panel user
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.InitialPassword);
        var newUser = new User
        {
            Email = panelRequest.PanelEmail,
            Name = panelRequest.PanelName,
            PasswordHash = passwordHash,
            Role = "Interviewer",
            CreatedAt = DateTime.UtcNow,
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        // Create interviewer profile
        var profile = new InterviewerProfile
        {
            UserId = newUser.Id,
            CreatedAt = DateTime.UtcNow,
        };

        _context.InterviewerProfiles.Add(profile);
        await _context.SaveChangesAsync();

        // Update panel request status
        panelRequest.Status = "APPROVED";
        panelRequest.ProcessedAt = DateTime.UtcNow;
        panelRequest.ProcessedByUserId = adminUserId;
        await _context.SaveChangesAsync();

        return Ok(new { 
            message = "Panel member created successfully",
            userId = newUser.Id,
            interviewerProfileId = profile.Id,
            email = newUser.Email
        });
    }

    /// <summary>
    /// Reject a panel request
    /// </summary>
    [HttpPost("reject-panel-request/{requestId}")]
    public async Task<ActionResult> RejectPanelRequest(int requestId)
    {
        if (!await IsAdminAsync())
        {
            return Forbid("Only admins can reject panel requests");
        }

        var panelRequest = await _context.PanelRequests.FindAsync(requestId);
        if (panelRequest == null)
        {
            return NotFound(new { message = "Panel request not found" });
        }

        if (panelRequest.Status != "PENDING")
        {
            return BadRequest(new { message = "Panel request has already been processed" });
        }

        var adminUserId = GetCurrentUserId();
        if (adminUserId == null)
        {
            return Unauthorized();
        }

        panelRequest.Status = "REJECTED";
        panelRequest.ProcessedAt = DateTime.UtcNow;
        panelRequest.ProcessedByUserId = adminUserId;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Panel request rejected" });
    }
}
