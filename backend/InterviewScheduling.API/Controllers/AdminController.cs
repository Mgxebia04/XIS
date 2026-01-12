using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using InterviewScheduling.API.Data;
using InterviewScheduling.API.DTOs;
using InterviewScheduling.API.Models;
using InterviewScheduling.API.Helpers;
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

    private int? GetCurrentUserId()
    {
        return AuthorizationHelper.GetCurrentUserId(this);
    }

    /// <summary>
    /// Onboard a new HR user
    /// </summary>
    [HttpPost("onboard-hr")]
    public async Task<ActionResult> OnboardHr([FromBody] OnboardHrRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid request data", errors = ModelState });
            }

            if (!await AuthorizationHelper.IsAdminAsync(this, _context))
            {
                return Forbid("Only admins can onboard HR users");
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("OnboardHr attempted with existing email: {Email}", request.Email);
                return Conflict(new { message = "User with this email already exists" });
            }

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

            _logger.LogInformation("HR user onboarded successfully: UserId={UserId}, Email={Email}", newUser.Id, newUser.Email);
            return Ok(new { 
                message = "HR user onboarded successfully",
                userId = newUser.Id,
                email = newUser.Email
            });
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error onboarding HR user");
            return StatusCode(500, new { message = "An error occurred while onboarding the HR user. Please try again." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error onboarding HR user");
            return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
        }
    }

    /// <summary>
    /// Get all pending panel requests
    /// </summary>
    [HttpGet("panel-requests")]
    public async Task<ActionResult<List<PanelRequestDto>>> GetPanelRequests()
    {
        try
        {
            if (!await AuthorizationHelper.IsAdminAsync(this, _context))
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting panel requests");
            return StatusCode(500, new { message = "An error occurred while retrieving panel requests. Please try again later." });
        }
    }

    /// <summary>
    /// Create a panel member from a pending request
    /// </summary>
    [HttpPost("create-panel")]
    public async Task<ActionResult> CreatePanel([FromBody] CreatePanelRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid request data", errors = ModelState });
            }

            if (!await AuthorizationHelper.IsAdminAsync(this, _context))
            {
                return Forbid("Only admins can create panel members");
            }

            var panelRequest = await _context.PanelRequests
                .Include(r => r.RequestedByUser)
                .FirstOrDefaultAsync(r => r.Id == request.PanelRequestId);

            if (panelRequest == null)
            {
                _logger.LogWarning("CreatePanel attempted for non-existent request: RequestId={RequestId}", request.PanelRequestId);
                return NotFound(new { message = "Panel request not found" });
            }

            if (panelRequest.Status != "PENDING")
            {
                return BadRequest(new { message = "Panel request has already been processed" });
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == panelRequest.PanelEmail);
            if (existingUser != null)
            {
                _logger.LogWarning("CreatePanel attempted with existing email: {Email}", panelRequest.PanelEmail);
                return Conflict(new { message = "User with this email already exists" });
            }

            var adminUserId = GetCurrentUserId();
            if (adminUserId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

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

            var profile = new InterviewerProfile
            {
                UserId = newUser.Id,
                CreatedAt = DateTime.UtcNow,
            };

            _context.InterviewerProfiles.Add(profile);
            await _context.SaveChangesAsync();

            panelRequest.Status = "APPROVED";
            panelRequest.ProcessedAt = DateTime.UtcNow;
            panelRequest.ProcessedByUserId = adminUserId;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Panel member created successfully: UserId={UserId}, ProfileId={ProfileId}, Email={Email}", newUser.Id, profile.Id, newUser.Email);
            return Ok(new { 
                message = "Panel member created successfully",
                userId = newUser.Id,
                interviewerProfileId = profile.Id,
                email = newUser.Email
            });
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error creating panel member");
            return StatusCode(500, new { message = "An error occurred while creating the panel member. Please try again." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating panel member");
            return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
        }
    }

    /// <summary>
    /// Reject a panel request
    /// </summary>
    [HttpPost("reject-panel-request/{requestId}")]
    public async Task<ActionResult> RejectPanelRequest(int requestId)
    {
        try
        {
            if (requestId <= 0)
            {
                return BadRequest(new { message = "Invalid request ID" });
            }

            if (!await AuthorizationHelper.IsAdminAsync(this, _context))
            {
                return Forbid("Only admins can reject panel requests");
            }

            var panelRequest = await _context.PanelRequests.FindAsync(requestId);
            if (panelRequest == null)
            {
                _logger.LogWarning("RejectPanelRequest attempted for non-existent request: RequestId={RequestId}", requestId);
                return NotFound(new { message = "Panel request not found" });
            }

            if (panelRequest.Status != "PENDING")
            {
                return BadRequest(new { message = "Panel request has already been processed" });
            }

            var adminUserId = GetCurrentUserId();
            if (adminUserId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            panelRequest.Status = "REJECTED";
            panelRequest.ProcessedAt = DateTime.UtcNow;
            panelRequest.ProcessedByUserId = adminUserId;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Panel request rejected: RequestId={RequestId}", requestId);
            return Ok(new { message = "Panel request rejected" });
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error rejecting panel request: {RequestId}", requestId);
            return StatusCode(500, new { message = "An error occurred while rejecting the panel request. Please try again." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting panel request: {RequestId}", requestId);
            return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
        }
    }
}
