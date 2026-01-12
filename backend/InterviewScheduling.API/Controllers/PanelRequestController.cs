using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using InterviewScheduling.API.Data;
using InterviewScheduling.API.DTOs;
using InterviewScheduling.API.Models;
using InterviewScheduling.API.Helpers;

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


    /// <summary>
    /// HR can request to add a new panel member
    /// </summary>
    [HttpPost("request-panel")]
    public async Task<ActionResult> RequestPanel([FromBody] RequestPanelDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid request data", errors = ModelState });
            }

            if (!await AuthorizationHelper.IsHrManagerAsync(this, _context))
            {
                return Forbid("Only HR Managers can request panel members");
            }

            var userId = AuthorizationHelper.GetCurrentUserId(this);
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.PanelEmail);
            if (existingUser != null)
            {
                _logger.LogWarning("RequestPanel attempted with existing email: {Email}", request.PanelEmail);
                return Conflict(new { message = "User with this email already exists" });
            }

            var existingRequest = await _context.PanelRequests
                .FirstOrDefaultAsync(r => r.PanelEmail == request.PanelEmail && r.Status == "PENDING");
            if (existingRequest != null)
            {
                return Conflict(new { message = "A pending request for this email already exists" });
            }

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

            _logger.LogInformation("Panel request submitted: RequestId={RequestId}, PanelEmail={PanelEmail}", panelRequest.Id, request.PanelEmail);
            return Ok(new { 
                message = "Panel request submitted successfully",
                requestId = panelRequest.Id
            });
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error submitting panel request");
            return StatusCode(500, new { message = "An error occurred while submitting the panel request. Please try again." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting panel request");
            return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
        }
    }

    /// <summary>
    /// Get panel requests made by current HR user
    /// </summary>
    [HttpGet("my-requests")]
    public async Task<ActionResult<List<PanelRequestDto>>> GetMyRequests()
    {
        try
        {
            if (!await AuthorizationHelper.IsHrManagerAsync(this, _context))
            {
                return Forbid("Only HR Managers can view panel requests");
            }

            var userId = AuthorizationHelper.GetCurrentUserId(this);
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting panel requests for user");
            return StatusCode(500, new { message = "An error occurred while retrieving panel requests. Please try again later." });
        }
    }
}
