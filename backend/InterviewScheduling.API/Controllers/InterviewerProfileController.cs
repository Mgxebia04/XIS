// AIModified:2026-01-11T19:25:50Z
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InterviewScheduling.API.Data;
using InterviewScheduling.API.DTOs;
using InterviewScheduling.API.Models;

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

    [HttpGet("{id}")]
    public async Task<ActionResult<InterviewerProfileDto>> GetProfile(int id)
    {
        var profile = await _context.InterviewerProfiles
            .Include(p => p.User)
            .Include(p => p.InterviewerSkills)
                .ThenInclude(s => s.Skill)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (profile == null)
        {
            return NotFound();
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

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateProfile(int id, [FromBody] InterviewerProfileDto dto)
    {
        var profile = await _context.InterviewerProfiles
            .Include(p => p.User)
            .Include(p => p.InterviewerSkills)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (profile == null)
        {
            return NotFound();
        }

        // Update User table with Name and ProfilePictureUrl
        profile.User.Name = dto.Name;
        profile.User.ProfilePictureUrl = dto.ProfilePictureUrl;
        profile.User.UpdatedAt = DateTime.UtcNow;
        
        // Update InterviewerProfile with Experience and Level
        profile.Experience = dto.Experience;
        profile.Level = dto.Level;
        profile.UpdatedAt = DateTime.UtcNow;

        // Update skills
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
        return NoContent();
    }
}
