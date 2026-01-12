// AIModified:2026-01-11T17:44:28Z
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InterviewScheduling.API.Data;
using InterviewScheduling.API.DTOs;
using InterviewScheduling.API.Models;
using InterviewScheduling.API.Helpers;

namespace InterviewScheduling.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AvailabilityController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AvailabilityController> _logger;

    public AvailabilityController(ApplicationDbContext context, ILogger<AvailabilityController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("interviewer/{interviewerId}")]
    public async Task<ActionResult<List<AvailabilitySlotDto>>> GetAvailability(int interviewerId)
    {
        try
        {
            if (interviewerId <= 0)
            {
                return BadRequest(new { message = "Invalid interviewer ID" });
            }

            var userId = AuthorizationHelper.GetCurrentUserId(this);
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var profile = await _context.InterviewerProfiles
                .FirstOrDefaultAsync(p => p.Id == interviewerId && p.UserId == userId);
            
            if (profile == null)
            {
                _logger.LogWarning("GetAvailability attempted for unauthorized profile: InterviewerId={InterviewerId}, UserId={UserId}", interviewerId, userId);
                return Forbid("You can only view your own availability");
            }

            var slots = await _context.AvailabilitySlots
                .Where(a => a.InterviewerProfileId == interviewerId && a.IsAvailable)
                .OrderBy(a => a.Date)
                .ThenBy(a => a.StartTime)
                .Select(a => new AvailabilitySlotDto
                {
                    Id = a.Id,
                    Date = a.Date,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    IsAvailable = a.IsAvailable
                })
                .ToListAsync();

            return Ok(slots);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting availability for interviewer: {InterviewerId}", interviewerId);
            return StatusCode(500, new { message = "An error occurred while retrieving availability. Please try again later." });
        }
    }

    [HttpPost("interviewer/{interviewerId}")]
    public async Task<ActionResult<AvailabilitySlotDto>> CreateAvailability(
        int interviewerId,
        [FromBody] CreateAvailabilitySlotDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid request data", errors = ModelState });
            }

            if (interviewerId <= 0)
            {
                return BadRequest(new { message = "Invalid interviewer ID" });
            }

            var userId = AuthorizationHelper.GetCurrentUserId(this);
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var profile = await _context.InterviewerProfiles
                .FirstOrDefaultAsync(p => p.Id == interviewerId && p.UserId == userId);
            
            if (profile == null)
            {
                _logger.LogWarning("CreateAvailability attempted for unauthorized profile: InterviewerId={InterviewerId}, UserId={UserId}", interviewerId, userId);
                return Forbid("You can only create availability for your own profile");
            }

            // Validate date is in the future
            var dateOnly = dto.Date.Date;
            if (dateOnly < DateTime.UtcNow.Date)
            {
                return BadRequest(new { message = "Availability date must be in the future" });
            }

            // Validate time range
            if (dto.EndTime <= dto.StartTime)
            {
                return BadRequest(new { message = "End time must be after start time" });
            }

            var existingSlot = await _context.AvailabilitySlots
                .FirstOrDefaultAsync(a => a.InterviewerProfileId == interviewerId
                    && a.Date == dateOnly
                    && a.StartTime == dto.StartTime
                    && a.EndTime == dto.EndTime
                    && a.IsAvailable);

            if (existingSlot != null)
            {
                return BadRequest(new { message = "This availability slot already exists. Please choose a different date or time." });
            }

            var slot = new AvailabilitySlot
            {
                InterviewerProfileId = interviewerId,
                Date = dateOnly,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                IsAvailable = true
            };

            _context.AvailabilitySlots.Add(slot);
            await _context.SaveChangesAsync();

            var result = new AvailabilitySlotDto
            {
                Id = slot.Id,
                Date = slot.Date,
                StartTime = slot.StartTime,
                EndTime = slot.EndTime,
                IsAvailable = slot.IsAvailable
            };

            _logger.LogInformation("Availability slot created: SlotId={SlotId}, InterviewerId={InterviewerId}", slot.Id, interviewerId);
            return CreatedAtAction(nameof(GetAvailability), new { interviewerId }, result);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error creating availability slot");
            return StatusCode(500, new { message = "An error occurred while creating the availability slot. Please try again." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating availability slot for interviewer: {InterviewerId}", interviewerId);
            return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAvailability(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "Invalid availability slot ID" });
            }

            var userId = AuthorizationHelper.GetCurrentUserId(this);
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var slot = await _context.AvailabilitySlots
                .Include(a => a.InterviewerProfile)
                .FirstOrDefaultAsync(a => a.Id == id);
            
            if (slot == null)
            {
                _logger.LogWarning("DeleteAvailability attempted for non-existent slot: SlotId={SlotId}", id);
                return NotFound(new { message = "Availability slot not found" });
            }

            if (slot.InterviewerProfile.UserId != userId)
            {
                _logger.LogWarning("DeleteAvailability attempted by unauthorized user: SlotId={SlotId}, UserId={UserId}", id, userId);
                return Forbid("You can only delete your own availability slots");
            }

            _context.AvailabilitySlots.Remove(slot);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Availability slot deleted: SlotId={SlotId}", id);
            return NoContent();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error deleting availability slot: {SlotId}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the availability slot. Please try again." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting availability slot: {SlotId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
        }
    }
}
