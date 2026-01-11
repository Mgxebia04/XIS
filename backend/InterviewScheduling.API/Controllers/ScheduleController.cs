// AIModified:2026-01-11T12:46:28Z
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InterviewScheduling.API.Data;
using InterviewScheduling.API.DTOs;
using InterviewScheduling.API.Models;

namespace InterviewScheduling.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScheduleController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ScheduleController> _logger;

    public ScheduleController(ApplicationDbContext context, ILogger<ScheduleController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("interviewer/{interviewerId}")]
    public async Task<ActionResult<List<Interview>>> GetInterviewerSchedule(int interviewerId)
    {
        var interviews = await _context.Interviews
            .Include(i => i.Interviewee)
            .Include(i => i.InterviewType)
            .Include(i => i.InterviewRequirements)
                .ThenInclude(r => r.Skill)
            .Where(i => i.InterviewerProfileId == interviewerId)
            .OrderBy(i => i.ScheduledDate)
            .ThenBy(i => i.StartTime)
            .ToListAsync();

        return Ok(interviews);
    }

    [HttpGet("all")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ScheduledInterviewDto>>> GetAllScheduledInterviews()
    {
        // Load interviews with necessary includes, then project to DTO to avoid circular references
        var interviews = await _context.Interviews
            .Include(i => i.Interviewee)
            .Include(i => i.InterviewerProfile)
                .ThenInclude(p => p.User)
            .Include(i => i.InterviewRequirements)
                .ThenInclude(r => r.Skill)
            .OrderBy(i => i.ScheduledDate)
            .ThenBy(i => i.StartTime)
            .ToListAsync();

        // Project to DTO after loading to avoid circular references and reduce payload size
        var result = interviews.Select(i => new ScheduledInterviewDto
        {
            Id = i.Id,
            CandidateName = i.Interviewee.Name,
            CandidateEmail = i.Interviewee.Email,
            PanelName = i.InterviewerProfile.User.Name ?? "Unknown",
            PanelEmail = i.InterviewerProfile.User.Email,
            Level = i.InterviewerProfile.Level,
            ScheduledDate = i.ScheduledDate,
            StartTime = i.StartTime,
            EndTime = i.EndTime,
            Skills = i.InterviewRequirements.Select(r => r.Skill.Name).ToList(),
            Status = i.Status
        }).ToList();

        return Ok(result);
    }

    [HttpPost("search")]
    public async Task<ActionResult<List<AvailableInterviewerDto>>> SearchAvailableInterviewers(
        [FromBody] InterviewSearchDto searchDto)
    {
        var query = _context.InterviewerProfiles
            .Include(p => p.User)
            .Include(p => p.InterviewerSkills)
                .ThenInclude(s => s.Skill)
            .Include(p => p.AvailabilitySlots)
            .AsQueryable();

        // Filter by primary skills
        if (searchDto.PrimarySkillIds != null && searchDto.PrimarySkillIds.Any())
        {
            query = query.Where(p => p.InterviewerSkills
                .Any(s => s.IsPrimary && searchDto.PrimarySkillIds.Contains(s.SkillId)));
        }

        // Filter by secondary skills
        if (searchDto.SecondarySkillIds != null && searchDto.SecondarySkillIds.Any())
        {
            query = query.Where(p => p.InterviewerSkills
                .Any(s => !s.IsPrimary && searchDto.SecondarySkillIds.Contains(s.SkillId)));
        }

        // Filter by date
        if (searchDto.InterviewDate.HasValue)
        {
            var date = searchDto.InterviewDate.Value.Date;
            query = query.Where(p => p.AvailabilitySlots
                .Any(a => a.Date == date && a.IsAvailable));
        }

        var profiles = await query.ToListAsync();

        var result = profiles.Select(p => new AvailableInterviewerDto
        {
            InterviewerProfileId = p.Id,
            Name = p.User.Name ?? "Unknown",
            ProfilePictureUrl = p.User.ProfilePictureUrl,
            Level = p.Level,
            Skills = p.InterviewerSkills.Select(s => s.Skill.Name).ToList(),
            AvailableTimeSlots = p.AvailabilitySlots
                .Where(a => !searchDto.InterviewDate.HasValue || a.Date == searchDto.InterviewDate.Value.Date)
                .Where(a => a.IsAvailable)
                .Select(a => new AvailableTimeSlotDto
                {
                    Date = a.Date,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime
                })
                .OrderBy(a => a.Date)
                .ThenBy(a => a.StartTime)
                .ToList()
        }).ToList();

        return Ok(result);
    }

    [HttpPost("create")]
    public async Task<ActionResult<Interview>> CreateInterview([FromBody] InterviewScheduleDto dto)
    {
        // Check if interviewer is available at the requested time
        var isAvailable = await _context.AvailabilitySlots
            .AnyAsync(a => a.InterviewerProfileId == dto.InterviewerProfileId
                && a.Date == dto.ScheduledDate.Date
                && a.StartTime <= dto.StartTime
                && a.EndTime >= dto.EndTime
                && a.IsAvailable);

        if (!isAvailable)
        {
            return BadRequest(new { message = "Interviewer is not available at the requested time" });
        }

        var interview = new Interview
        {
            InterviewerProfileId = dto.InterviewerProfileId,
            IntervieweeId = dto.IntervieweeId,
            InterviewTypeId = dto.InterviewTypeId,
            ScheduledDate = dto.ScheduledDate.Date,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Status = "Scheduled"
        };

        _context.Interviews.Add(interview);
        await _context.SaveChangesAsync();

        // Add interview requirements
        foreach (var skillId in dto.PrimarySkillIds)
        {
            interview.InterviewRequirements.Add(new InterviewRequirement
            {
                InterviewId = interview.Id,
                SkillId = skillId,
                IsPrimary = true
            });
        }

        foreach (var skillId in dto.SecondarySkillIds)
        {
            interview.InterviewRequirements.Add(new InterviewRequirement
            {
                InterviewId = interview.Id,
                SkillId = skillId,
                IsPrimary = false
            });
        }

        // Mark availability slot as unavailable
        var availabilitySlot = await _context.AvailabilitySlots
            .FirstOrDefaultAsync(a => a.InterviewerProfileId == dto.InterviewerProfileId
                && a.Date == dto.ScheduledDate.Date
                && a.StartTime <= dto.StartTime
                && a.EndTime >= dto.EndTime
                && a.IsAvailable);

        if (availabilitySlot != null)
        {
            availabilitySlot.IsAvailable = false;
            availabilitySlot.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        var result = await _context.Interviews
            .Include(i => i.Interviewee)
            .Include(i => i.InterviewType)
            .Include(i => i.InterviewRequirements)
                .ThenInclude(r => r.Skill)
            .FirstOrDefaultAsync(i => i.Id == interview.Id);

        return CreatedAtAction(nameof(GetInterviewerSchedule), new { interviewerId = dto.InterviewerProfileId }, result);
    }

    [HttpPut("cancel/{interviewId}")]
    [AllowAnonymous]
    public async Task<ActionResult> CancelInterview(int interviewId)
    {
        var interview = await _context.Interviews
            .FirstOrDefaultAsync(i => i.Id == interviewId);

        if (interview == null)
        {
            return NotFound(new { message = "Interview not found" });
        }

        if (interview.Status == "Cancelled")
        {
            return BadRequest(new { message = "Interview is already cancelled" });
        }

        interview.Status = "Cancelled";
        interview.UpdatedAt = DateTime.UtcNow;

        // Mark the availability slot as available again
        var availabilitySlot = await _context.AvailabilitySlots
            .FirstOrDefaultAsync(a => a.InterviewerProfileId == interview.InterviewerProfileId
                && a.Date == interview.ScheduledDate.Date
                && a.StartTime <= interview.StartTime
                && a.EndTime >= interview.EndTime
                && !a.IsAvailable);

        if (availabilitySlot != null)
        {
            availabilitySlot.IsAvailable = true;
            availabilitySlot.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
