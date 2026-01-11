using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using InterviewScheduling.API.Data;
using InterviewScheduling.API.DTOs;
using InterviewScheduling.API.Models;

namespace InterviewScheduling.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Require authentication
public class PanelRequestController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PanelRequestController> _logger;

    public PanelRequestController(ApplicationDbContext context, ILogger<PanelRequestController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private int? GetCurrentUserId()
    {
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
    /// HR can request to add a new panel member
    /// </summary>
    [HttpPost("request-panel")]
    public async Task<ActionResult> RequestPanel([FromBody] PanelRequestDto request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        // Verify user is HR Manager
        var user = await _context.Users.FindAsync(userId);
        if (user == null || user.Role != "HR Manager")
        {
            return Forbid("Only HR Managers can request panel members");
        }

        // Validate input
        if (string.IsNullOrWhiteSpace(request.PanelName) || string.IsNullOrWhiteSpace(request.PanelEmail))
        {
            return BadRequest(new { message = "Panel name and email are required" });
        }

        // Check if email already exists
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.PanelEmail);
        if (existingUser != null)
        {
            return Conflict(new { message = "User with this email already exists" });
        }

        // Check if there's already a pending request for this email
        var existingRequest = await _context.PanelRequests
            .FirstOrDefaultAsync(r => r.PanelEmail == request.PanelEmail && r.Status == "PENDING");
        if (existingRequest != null)
        {
            return Conflict(new { message = "A pending request for this email already exists" });
        }

        // Create panel request
        var panelRequest = new PanelRequest
        {
            RequestedByUserId = userId,
            PanelName = request.PanelName,
            PanelEmail = request.PanelEmail,
            Notes = request.Notes,
            Status = "PENDING",
            CreatedAt = DateTime.UtcNow,
        };

        _context.PanelRequests.Add(panelRequest);
        await _context.SaveChangesAsync();

        return Ok(new { 
            message = "Panel request submitted successfully",
            requestId = panelRequest.Id
        });
    }

    /// <summary>
    /// Get panel requests made by current HR user
    /// </summary>
    [HttpGet("my-requests")]
    public async Task<ActionResult<List<PanelRequestDto>>> GetMyRequests()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var requests = await _context.PanelRequests
            .Include(r => r.RequestedByUser)
            .Where(r => r.RequestedByUserId == userId)
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
}
