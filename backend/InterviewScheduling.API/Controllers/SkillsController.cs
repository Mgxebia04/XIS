// AIModified:2026-01-11T05:42:58Z
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InterviewScheduling.API.Data;
using InterviewScheduling.API.DTOs;

namespace InterviewScheduling.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SkillsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SkillsController> _logger;

    public SkillsController(ApplicationDbContext context, ILogger<SkillsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<SkillDto>>> GetAllSkills()
    {
        var skills = await _context.Skills
            .OrderBy(s => s.Name)
            .Select(s => new SkillDto
            {
                Id = s.Id,
                Name = s.Name
            })
            .ToListAsync();

        return Ok(skills);
    }
}
