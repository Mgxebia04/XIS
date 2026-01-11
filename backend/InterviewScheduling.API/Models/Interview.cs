// AIModified:2026-01-11T16:22:15Z
namespace InterviewScheduling.API.Models;

public class Interview
{
    public int Id { get; set; }
    public int InterviewerProfileId { get; set; }
    public int IntervieweeId { get; set; }
    public int InterviewTypeId { get; set; }
    public DateTime ScheduledDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string Status { get; set; } = "Scheduled"; // Scheduled, Completed, Cancelled
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public int? CreatedByUserId { get; set; } // HR user who scheduled the interview
    
    // Navigation properties
    public InterviewerProfile InterviewerProfile { get; set; } = null!;
    public Interviewee Interviewee { get; set; } = null!;
    public InterviewType InterviewType { get; set; } = null!;
    public User? CreatedByUser { get; set; } // HR user who scheduled the interview
    public ICollection<InterviewRequirement> InterviewRequirements { get; set; } = new List<InterviewRequirement>();
}
