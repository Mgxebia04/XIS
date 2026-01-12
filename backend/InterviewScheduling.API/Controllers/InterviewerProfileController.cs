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
public class InterviewerProfileController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<InterviewerProfileController> _logger;

    public InterviewerProfileController(ApplicationDbContext context, ILogger<InterviewerProfileController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("all-with-stats")]
    [AllowAnonymous]
    public async Task<ActionResult<List<InterviewerStatsDto>>> GetAllInterviewersWithStats()
    {
        try
        {
            var interviewers = await _context.InterviewerProfiles
                .Include(p => p.User)
                .Select(p => new InterviewerStatsDto
                {
                    InterviewerProfileId = p.Id,
                    Name = p.User.Name ?? "Unknown",
                    Email = p.User.Email,
                    Experience = p.Experience ?? "Not specified",
                    Level = p.Level ?? "Not specified",
                    TotalCompletedInterviews = _context.Interviews
                        .Count(i => i.InterviewerProfileId == p.Id && i.Status == "Completed")
                })
                .OrderByDescending(i => i.TotalCompletedInterviews)
                .ThenBy(i => i.Name)
                .ToListAsync();

            return Ok(interviewers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all interviewers with stats");
            return StatusCode(500, new { message = "An error occurred while retrieving interviewers. Please try again later." });
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<InterviewerProfileDto>> GetProfile(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "Invalid profile ID" });
            }

            var userId = AuthorizationHelper.GetCurrentUserId(this);
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var profile = await _context.InterviewerProfiles
                .Include(p => p.User)
                .Include(p => p.InterviewerSkills)
                    .ThenInclude(s => s.Skill)
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (profile == null)
            {
                _logger.LogWarning("GetProfile attempted for non-existent or unauthorized profile: ProfileId={ProfileId}, UserId={UserId}", id, userId);
                return NotFound(new { message = "Profile not found" });
            }

            var dto = new InterviewerProfileDto
            {
                Id = profile.Id,
                Name = profile.User.Name,
                ProfilePictureUrl = profile.User.ProfilePictureUrl,
                Experience = profile.Experience,
                Level = profile.Level,
                PrimarySkills = profile.InterviewerSkills
                    .Where(s => s.IsPrimary)
                    .Select(s => new SkillDto { Id = s.Skill.Id, Name = s.Skill.Name })
                    .ToList(),
                SecondarySkills = profile.InterviewerSkills
                    .Where(s => !s.IsPrimary)
                    .Select(s => new SkillDto { Id = s.Skill.Id, Name = s.Skill.Name })
                    .ToList()
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting profile: {ProfileId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the profile. Please try again later." });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult> UpdateProfile(int id, [FromBody] InterviewerProfileDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid request data", errors = ModelState });
            }

            if (id <= 0)
            {
                return BadRequest(new { message = "Invalid profile ID" });
            }

            var userId = AuthorizationHelper.GetCurrentUserId(this);
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var profile = await _context.InterviewerProfiles
                .Include(p => p.User)
                .Include(p => p.InterviewerSkills)
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (profile == null)
            {
                _logger.LogWarning("UpdateProfile attempted for non-existent or unauthorized profile: ProfileId={ProfileId}, UserId={UserId}", id, userId);
                return NotFound(new { message = "Profile not found" });
            }

            // Validate skill IDs exist
            var allSkillIds = dto.PrimarySkills.Select(s => s.Id).Concat(dto.SecondarySkills.Select(s => s.Id)).ToList();
            var existingSkills = await _context.Skills
                .Where(s => allSkillIds.Contains(s.Id))
                .Select(s => s.Id)
                .ToListAsync();

            var invalidSkillIds = allSkillIds.Except(existingSkills).ToList();
            if (invalidSkillIds.Any())
            {
                return BadRequest(new { message = $"Invalid skill IDs: {string.Join(", ", invalidSkillIds)}" });
            }

            profile.User.Name = dto.Name;
            profile.User.ProfilePictureUrl = dto.ProfilePictureUrl;
            profile.User.UpdatedAt = DateTime.UtcNow;
            profile.Experience = dto.Experience;
            profile.Level = dto.Level;
            profile.UpdatedAt = DateTime.UtcNow;

            _context.InterviewerSkills.RemoveRange(profile.InterviewerSkills);

            foreach (var skill in dto.PrimarySkills)
            {
                profile.InterviewerSkills.Add(new InterviewerSkill
                {
                    InterviewerProfileId = profile.Id,
                    SkillId = skill.Id,
                    IsPrimary = true
                });
            }

            foreach (var skill in dto.SecondarySkills)
            {
                profile.InterviewerSkills.Add(new InterviewerSkill
                {
                    InterviewerProfileId = profile.Id,
                    SkillId = skill.Id,
                    IsPrimary = false
                });
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Profile updated successfully: ProfileId={ProfileId}", id);
            return NoContent();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error updating profile: {ProfileId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the profile. Please try again." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile: {ProfileId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
        }
    }
}
