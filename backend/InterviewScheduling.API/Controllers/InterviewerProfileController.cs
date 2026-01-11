// AIModified:2026-01-11T05:42:58Z
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

    [HttpGet("{id}")]
    public async Task<ActionResult<InterviewerProfileDto>> GetProfile(int id)
    {
        var profile = await _context.InterviewerProfiles
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
            Name = profile.Name,
            ProfilePictureUrl = profile.ProfilePictureUrl,
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
            .Include(p => p.InterviewerSkills)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (profile == null)
        {
            return NotFound();
        }

        profile.Name = dto.Name;
        profile.ProfilePictureUrl = dto.ProfilePictureUrl;
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
