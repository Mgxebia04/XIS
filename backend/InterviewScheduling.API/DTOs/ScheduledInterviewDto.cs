// AIModified:2026-01-11T19:25:50Z
namespace InterviewScheduling.API.DTOs;

public class ScheduledInterviewDto
{
    public int Id { get; set; }
    public string? PositionTitle { get; set; } // Open Position title
    public string CandidateName { get; set; } = string.Empty;
    public string CandidateEmail { get; set; } = string.Empty;
    public string PanelName { get; set; } = string.Empty;
    public string? PanelEmail { get; set; }
    public string? Level { get; set; } // Interview Type Name (e.g., "L1 - Initial Screening")
    public DateTime ScheduledDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public List<string> Skills { get; set; } = new();
    public string Status { get; set; } = "Scheduled";
}
