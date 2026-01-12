// AIModified:2026-01-11T16:22:15Z
using System.ComponentModel.DataAnnotations;

namespace InterviewScheduling.API.DTOs;

public class InterviewScheduleDto
{
    [Required(ErrorMessage = "Interviewer profile ID is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Invalid interviewer profile ID")]
    public int InterviewerProfileId { get; set; }
    
    [Required(ErrorMessage = "Interviewee ID is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Invalid interviewee ID")]
    public int IntervieweeId { get; set; }
    
    [Required(ErrorMessage = "Interview type ID is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Invalid interview type ID")]
    public int InterviewTypeId { get; set; }
    
    [Required(ErrorMessage = "Scheduled date is required")]
    public DateTime ScheduledDate { get; set; }
    
    [Required(ErrorMessage = "Start time is required")]
    public TimeSpan StartTime { get; set; }
    
    [Required(ErrorMessage = "End time is required")]
    public TimeSpan EndTime { get; set; }
    
    public List<int> PrimarySkillIds { get; set; } = new();
    public List<int> SecondarySkillIds { get; set; } = new();
    
    public int? CreatedByUserId { get; set; } // HR user who scheduled the interview
}

public class AvailableInterviewerDto
{
    public int InterviewerProfileId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
    public string? Level { get; set; }
    public List<string> Skills { get; set; } = new();
    public List<AvailableTimeSlotDto> AvailableTimeSlots { get; set; } = new();
}

public class AvailableTimeSlotDto
{
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}

public class InterviewSearchDto
{
    public List<int>? PrimarySkillIds { get; set; }
    public List<int>? SecondarySkillIds { get; set; }
    public int? InterviewTypeId { get; set; }
    public DateTime? InterviewDate { get; set; }
    public int? PositionId { get; set; }
    public int? IntervieweeId { get; set; }
}
