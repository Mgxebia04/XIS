// AIModified:2026-01-11T05:42:58Z
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InterviewScheduling.API.Data;
using InterviewScheduling.API.Models;

namespace InterviewScheduling.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InterviewTypesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<InterviewTypesController> _logger;

    public InterviewTypesController(ApplicationDbContext context, ILogger<InterviewTypesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<InterviewType>>> GetAllInterviewTypes()
    {
        var types = await _context.InterviewTypes
            .OrderBy(t => t.Name)
            .ToListAsync();

        return Ok(types);
    }
}
