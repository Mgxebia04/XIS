// AIModified:2026-01-11T19:25:50Z
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
    [Authorize]
    public async Task<ActionResult<List<InterviewerScheduleDto>>> GetInterviewerSchedule(int interviewerId)
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
                _logger.LogWarning("GetInterviewerSchedule attempted for unauthorized profile: InterviewerId={InterviewerId}, UserId={UserId}", interviewerId, userId);
                return Forbid("You can only view your own schedule");
            }

            var interviews = await (from i in _context.Interviews
                                    where i.InterviewerProfileId == interviewerId
                                    join hr in _context.Users on i.CreatedByUserId equals hr.Id into hrGroup
                                    from hrUser in hrGroup.DefaultIfEmpty()
                                    select new InterviewerScheduleDto
                                    {
                                        Id = i.Id,
                                        InterviewerProfileId = i.InterviewerProfileId,
                                        IntervieweeId = i.IntervieweeId,
                                        InterviewTypeId = i.InterviewTypeId,
                                        ScheduledDate = i.ScheduledDate,
                                        StartTime = i.StartTime,
                                        EndTime = i.EndTime,
                                        Status = i.Status,
                                        CandidateName = i.Interviewee.Name,
                                        CandidateEmail = i.Interviewee.Email,
                                        InterviewTypeName = i.InterviewType.Name,
                                        Skills = i.InterviewRequirements.Select(r => r.Skill.Name).ToList(),
                                        HrName = hrUser != null ? hrUser.Name : null,
                                        HrEmail = hrUser != null ? hrUser.Email : null
                                    })
                                    .OrderBy(i => i.ScheduledDate)
                                    .ThenBy(i => i.StartTime)
                                    .ToListAsync();

            return Ok(interviews);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting interviewer schedule: {InterviewerId}", interviewerId);
            return StatusCode(500, new { message = "An error occurred while retrieving the schedule. Please try again later." });
        }
    }

    [HttpGet("all")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ScheduledInterviewDto>>> GetAllScheduledInterviews()
    {
        try
        {
            // Load interviews with necessary includes, then project to DTO to avoid circular references
            var interviews = await _context.Interviews
                .Include(i => i.Interviewee)
                    .ThenInclude(e => e.Position) // Include Position for Open Position
                .Include(i => i.InterviewerProfile)
                    .ThenInclude(p => p.User)
                .Include(i => i.InterviewType) // Include InterviewType for Level
                .Include(i => i.InterviewRequirements)
                    .ThenInclude(r => r.Skill)
                .OrderBy(i => i.ScheduledDate)
                .ThenBy(i => i.StartTime)
                .ToListAsync();

        // Project to DTO after loading to avoid circular references and reduce payload size
        var result = interviews.Select(i => new ScheduledInterviewDto
        {
            Id = i.Id,
            PositionTitle = i.Interviewee.Position != null ? i.Interviewee.Position.Title : null,
            CandidateName = i.Interviewee.Name,
            CandidateEmail = i.Interviewee.Email,
            PanelName = i.InterviewerProfile.User.Name ?? "Unknown",
            PanelEmail = i.InterviewerProfile.User.Email,
            Level = i.InterviewType.Name,
            ScheduledDate = i.ScheduledDate,
            StartTime = i.StartTime,
            EndTime = i.EndTime,
            Skills = i.InterviewRequirements.Select(r => r.Skill.Name).ToList(),
            Status = i.Status
        }).ToList();

        return Ok(result);
    }

    [HttpPost("search")]
    [Authorize]
    public async Task<ActionResult<List<AvailableInterviewerDto>>> SearchAvailableInterviewers(
        [FromBody] InterviewSearchDto searchDto)
    {
        try
        {
            if (searchDto == null)
            {
                return BadRequest(new { message = "Search criteria are required" });
            }

            // Only HR Managers can search for interviewers
            if (!await AuthorizationHelper.IsHrManagerAsync(this, _context))
            {
                return Forbid("Only HR Managers can search for available interviewers");
            }

            // Validate skill IDs if provided
            if (searchDto.PrimarySkillIds != null && searchDto.PrimarySkillIds.Any())
            {
                var invalidIds = searchDto.PrimarySkillIds.Where(id => id <= 0).ToList();
                if (invalidIds.Any())
                {
                    return BadRequest(new { message = $"Invalid primary skill IDs: {string.Join(", ", invalidIds)}" });
                }
            }

            if (searchDto.SecondarySkillIds != null && searchDto.SecondarySkillIds.Any())
            {
                var invalidIds = searchDto.SecondarySkillIds.Where(id => id <= 0).ToList();
                if (invalidIds.Any())
                {
                    return BadRequest(new { message = $"Invalid secondary skill IDs: {string.Join(", ", invalidIds)}" });
                }
            }

            // Validate interview type ID if provided
            if (searchDto.InterviewTypeId.HasValue && searchDto.InterviewTypeId.Value <= 0)
            {
                return BadRequest(new { message = "Invalid interview type ID" });
            }

            // Validate position ID if provided
            if (searchDto.PositionId.HasValue && searchDto.PositionId.Value <= 0)
            {
                return BadRequest(new { message = "Invalid position ID" });
            }

            // Validate interviewee ID if provided
            if (searchDto.IntervieweeId.HasValue && searchDto.IntervieweeId.Value <= 0)
            {
                return BadRequest(new { message = "Invalid interviewee ID" });
            }

            var query = _context.InterviewerProfiles
                .Include(p => p.User)
                .Include(p => p.InterviewerSkills)
                    .ThenInclude(s => s.Skill)
                .Include(p => p.AvailabilitySlots)
                .AsQueryable();

            if (searchDto.PrimarySkillIds != null && searchDto.PrimarySkillIds.Any())
            {
                query = query.Where(p => p.InterviewerSkills
                    .Any(s => s.IsPrimary && searchDto.PrimarySkillIds.Contains(s.SkillId)));
            }

            if (searchDto.SecondarySkillIds != null && searchDto.SecondarySkillIds.Any())
            {
                query = query.Where(p => p.InterviewerSkills
                    .Any(s => !s.IsPrimary && searchDto.SecondarySkillIds.Contains(s.SkillId)));
            }

            if (searchDto.InterviewDate.HasValue)
            {
                var date = searchDto.InterviewDate.Value.Date;
                if (date < DateTime.UtcNow.Date)
                {
                    return BadRequest(new { message = "Interview date cannot be in the past" });
                }
                query = query.Where(p => p.AvailabilitySlots
                    .Any(a => a.Date == date && a.IsAvailable));
            }

            var result = await query
                .Select(p => new AvailableInterviewerDto
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
                })
                .ToListAsync();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching for available interviewers");
            return StatusCode(500, new { message = "An error occurred while searching for interviewers. Please try again later." });
        }
    }

    [HttpPost("create")]
    [Authorize]
    public async Task<ActionResult<Interview>> CreateInterview([FromBody] InterviewScheduleDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid request data", errors = ModelState });
            }

            if (!await AuthorizationHelper.IsHrManagerAsync(this, _context))
            {
                return Forbid("Only HR Managers can create interviews");
            }

            // Validate date is in the future
            if (dto.ScheduledDate.Date < DateTime.UtcNow.Date)
            {
                return BadRequest(new { message = "Interview date must be in the future" });
            }

            // Validate time range
            if (dto.EndTime <= dto.StartTime)
            {
                return BadRequest(new { message = "End time must be after start time" });
            }

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
            Status = "Scheduled",
            CreatedByUserId = dto.CreatedByUserId
        };

        _context.Interviews.Add(interview);
        await _context.SaveChangesAsync();

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

            _logger.LogInformation("Interview created successfully: InterviewId={InterviewId}, InterviewerId={InterviewerId}", interview.Id, dto.InterviewerProfileId);
            return CreatedAtAction(nameof(GetInterviewerSchedule), new { interviewerId = dto.InterviewerProfileId }, result);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error creating interview");
            return StatusCode(500, new { message = "An error occurred while creating the interview. Please try again." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating interview");
            return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
        }
    }

    [HttpPut("cancel/{interviewId}")]
    [Authorize]
    public async Task<ActionResult> CancelInterview(int interviewId)
    {
        try
        {
            if (interviewId <= 0)
            {
                return BadRequest(new { message = "Invalid interview ID" });
            }

            var interview = await _context.Interviews
                .Include(i => i.InterviewerProfile)
                .FirstOrDefaultAsync(i => i.Id == interviewId);

            if (interview == null)
            {
                _logger.LogWarning("Cancel interview attempted for non-existent interview: {InterviewId}", interviewId);
                return NotFound(new { message = "Interview not found" });
            }

            var userId = AuthorizationHelper.GetCurrentUserId(this);
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            if (interview.InterviewerProfile.UserId != userId)
            {
                _logger.LogWarning("Cancel interview attempted by unauthorized user: UserId={UserId}, InterviewId={InterviewId}", userId, interviewId);
                return Forbid("You can only cancel your own interviews");
            }

            if (interview.Status == "Cancelled")
            {
                return BadRequest(new { message = "Interview is already cancelled" });
            }

            interview.Status = "Cancelled";
            interview.UpdatedAt = DateTime.UtcNow;

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

            _logger.LogInformation("Interview cancelled successfully: InterviewId={InterviewId}", interviewId);
            return NoContent();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error cancelling interview: {InterviewId}", interviewId);
            return StatusCode(500, new { message = "An error occurred while cancelling the interview. Please try again." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling interview: {InterviewId}", interviewId);
            return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
        }
    }
}
