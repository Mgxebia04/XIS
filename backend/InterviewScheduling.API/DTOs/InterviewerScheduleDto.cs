// AIModified:2026-01-11T17:03:46Z
namespace InterviewScheduling.API.DTOs;

public class InterviewerScheduleDto
{
    public int Id { get; set; }
    public int InterviewerProfileId { get; set; }
    public int IntervieweeId { get; set; }
    public int InterviewTypeId { get; set; }
    public DateTime ScheduledDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string Status { get; set; } = "Scheduled";
    
    // Candidate details
    public string CandidateName { get; set; } = string.Empty;
    public string CandidateEmail { get; set; } = string.Empty;
    
    // Interview type
    public string InterviewTypeName { get; set; } = string.Empty;
    
    // Skills
    public List<string> Skills { get; set; } = new();
    
    // HR details
    public string? HrName { get; set; }
    public string? HrEmail { get; set; }
}
