// AIModified:2026-01-11T05:42:58Z
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
    
    // Navigation properties
    public InterviewerProfile InterviewerProfile { get; set; } = null!;
    public Interviewee Interviewee { get; set; } = null!;
    public InterviewType InterviewType { get; set; } = null!;
    public ICollection<InterviewRequirement> InterviewRequirements { get; set; } = new List<InterviewRequirement>();
}
