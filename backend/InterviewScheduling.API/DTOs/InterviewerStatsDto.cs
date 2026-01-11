// AIModified:2026-01-11T19:25:50Z
namespace InterviewScheduling.API.DTOs;

public class InterviewerStatsDto
{
    public int InterviewerProfileId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Experience { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public int TotalCompletedInterviews { get; set; }
}
