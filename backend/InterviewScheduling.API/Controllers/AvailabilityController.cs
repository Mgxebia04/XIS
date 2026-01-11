// AIModified:2026-01-11T17:44:28Z
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InterviewScheduling.API.Data;
using InterviewScheduling.API.DTOs;
using InterviewScheduling.API.Models;

namespace InterviewScheduling.API.Controllers;

[ApiController]
[Route("api/[controller]")]
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

    [HttpPost("interviewer/{interviewerId}")]
    public async Task<ActionResult<AvailabilitySlotDto>> CreateAvailability(
        int interviewerId,
        [FromBody] CreateAvailabilitySlotDto dto)
    {
        // Check for duplicate slot - same date, start time, and end time for the same interviewer
        var dateOnly = dto.Date.Date;
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

        return CreatedAtAction(nameof(GetAvailability), new { interviewerId }, result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAvailability(int id)
    {
        var slot = await _context.AvailabilitySlots.FindAsync(id);
        if (slot == null)
        {
            return NotFound();
        }

        _context.AvailabilitySlots.Remove(slot);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
