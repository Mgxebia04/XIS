// AIModified:2026-01-11T05:42:58Z
namespace InterviewScheduling.API.Models;

public class AvailabilitySlot
{
    public int Id { get; set; }
    public int InterviewerProfileId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsAvailable { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public InterviewerProfile InterviewerProfile { get; set; } = null!;
}
