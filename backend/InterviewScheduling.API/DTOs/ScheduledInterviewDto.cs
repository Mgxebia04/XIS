// AIModified:2026-01-11T12:57:07Z
namespace InterviewScheduling.API.DTOs;

public class ScheduledInterviewDto
{
    public int Id { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public string CandidateEmail { get; set; } = string.Empty;
    public string PanelName { get; set; } = string.Empty;
    public string? PanelEmail { get; set; }
    public string? Level { get; set; }
    public DateTime ScheduledDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public List<string> Skills { get; set; } = new();
    public string Status { get; set; } = "Scheduled";
}
