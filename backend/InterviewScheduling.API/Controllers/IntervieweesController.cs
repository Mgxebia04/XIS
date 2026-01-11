// AIModified:2026-01-11T05:42:58Z
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
    public async Task<ActionResult<List<Interviewee>>> GetAllInterviewees([FromQuery] int? positionId = null)
    {
        var query = _context.Interviewees.AsQueryable();
        
        // Filter by position if provided
        if (positionId.HasValue)
        {
            query = query.Where(i => i.PositionId == positionId.Value);
        }
        
        var interviewees = await query
            .OrderBy(i => i.Name)
            .ToListAsync();

        return Ok(interviewees);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Interviewee>> GetInterviewee(int id)
    {
        var interviewee = await _context.Interviewees.FindAsync(id);
        if (interviewee == null)
        {
            return NotFound();
        }

        return Ok(interviewee);
    }

    [HttpPost]
    public async Task<ActionResult<Interviewee>> CreateInterviewee([FromBody] Interviewee interviewee)
    {
        _context.Interviewees.Add(interviewee);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInterviewee), new { id = interviewee.Id }, interviewee);
    }
}
