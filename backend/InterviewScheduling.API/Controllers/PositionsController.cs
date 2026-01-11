// AIModified:2026-01-11T14:58:01Z
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InterviewScheduling.API.Data;
using InterviewScheduling.API.Models;

namespace InterviewScheduling.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PositionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PositionsController> _logger;

    public PositionsController(ApplicationDbContext context, ILogger<PositionsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<OpenPosition>>> GetAllPositions()
    {
        var positions = await _context.OpenPositions
            .Where(p => p.IsActive)
            .OrderBy(p => p.Title)
            .ToListAsync();

        return Ok(positions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OpenPosition>> GetPosition(int id)
    {
        var position = await _context.OpenPositions.FindAsync(id);
        if (position == null)
        {
            return NotFound();
        }

        return Ok(position);
    }
}
