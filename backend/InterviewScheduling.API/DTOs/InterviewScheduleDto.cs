// AIModified:2026-01-11T05:42:58Z
namespace InterviewScheduling.API.DTOs;

public class InterviewScheduleDto
{
    public int InterviewerProfileId { get; set; }
    public int IntervieweeId { get; set; }
    public int InterviewTypeId { get; set; }
    public DateTime ScheduledDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public List<int> PrimarySkillIds { get; set; } = new();
    public List<int> SecondarySkillIds { get; set; } = new();
}

public class AvailableInterviewerDto
{
    public int InterviewerProfileId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
    public string? Level { get; set; }
    public List<string> Skills { get; set; } = new();
    public List<TimeSpan> AvailableTimeSlots { get; set; } = new();
}

public class InterviewSearchDto
{
    public List<int>? PrimarySkillIds { get; set; }
    public List<int>? SecondarySkillIds { get; set; }
    public int? InterviewTypeId { get; set; }
    public DateTime? InterviewDate { get; set; }
}
