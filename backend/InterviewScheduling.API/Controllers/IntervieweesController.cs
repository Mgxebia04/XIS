// AIModified:2026-01-11T19:25:50Z
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InterviewScheduling.API.Data;
using InterviewScheduling.API.Models;

namespace InterviewScheduling.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IntervieweesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<IntervieweesController> _logger;

    public IntervieweesController(ApplicationDbContext context, ILogger<IntervieweesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<Interviewee>>> GetAllInterviewees([FromQuery] int? positionId = null)
    {
        try
        {
            var query = _context.Interviewees.AsQueryable();
            
            // Filter by position if provided
            if (positionId.HasValue)
            {
                if (positionId.Value <= 0)
                {
                    return BadRequest(new { message = "Invalid position ID" });
                }
                query = query.Where(i => i.PositionId == positionId.Value);
            }
            
            var interviewees = await query
                .OrderBy(i => i.Name)
                .ToListAsync();

            return Ok(interviewees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all interviewees");
            return StatusCode(500, new { message = "An error occurred while retrieving interviewees. Please try again later." });
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<Interviewee>> GetInterviewee(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "Invalid interviewee ID" });
            }

            var interviewee = await _context.Interviewees.FindAsync(id);
            if (interviewee == null)
            {
                _logger.LogWarning("GetInterviewee attempted for non-existent interviewee: IntervieweeId={IntervieweeId}", id);
                return NotFound(new { message = "Interviewee not found" });
            }

            return Ok(interviewee);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting interviewee: {IntervieweeId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the interviewee. Please try again later." });
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Interviewee>> CreateInterviewee([FromBody] Interviewee interviewee)
    {
        try
        {
            if (interviewee == null)
            {
                return BadRequest(new { message = "Interviewee data is required" });
            }

            if (string.IsNullOrWhiteSpace(interviewee.Name))
            {
                return BadRequest(new { message = "Interviewee name is required" });
            }

            if (string.IsNullOrWhiteSpace(interviewee.Email))
            {
                return BadRequest(new { message = "Interviewee email is required" });
            }

            // Validate email format
            if (!interviewee.Email.Contains("@") || !interviewee.Email.Contains("."))
            {
                return BadRequest(new { message = "Invalid email format" });
            }

            // Check if email already exists
            var existingInterviewee = await _context.Interviewees
                .FirstOrDefaultAsync(i => i.Email == interviewee.Email);
            if (existingInterviewee != null)
            {
                return Conflict(new { message = "Interviewee with this email already exists" });
            }

            // Validate position exists if provided
            if (interviewee.PositionId.HasValue)
            {
                var positionExists = await _context.OpenPositions
                    .AnyAsync(p => p.Id == interviewee.PositionId.Value);
                if (!positionExists)
                {
                    return BadRequest(new { message = "Invalid position ID" });
                }
            }

            interviewee.CreatedAt = DateTime.UtcNow;
            _context.Interviewees.Add(interviewee);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Interviewee created successfully: IntervieweeId={IntervieweeId}, Email={Email}", interviewee.Id, interviewee.Email);
            return CreatedAtAction(nameof(GetInterviewee), new { id = interviewee.Id }, interviewee);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error creating interviewee");
            return StatusCode(500, new { message = "An error occurred while creating the interviewee. Please try again." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating interviewee");
            return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
        }
    }
}
