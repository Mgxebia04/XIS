// AIModified:2026-01-11T11:13:42Z
namespace InterviewScheduling.API.Models;

public class InterviewerProfile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    // Name and ProfilePictureUrl moved to Users table
    public string? Experience { get; set; } // e.g., "5-10 years"
    public string? Level { get; set; } // e.g., "Mid-level"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<InterviewerSkill> InterviewerSkills { get; set; } = new List<InterviewerSkill>();
    public ICollection<AvailabilitySlot> AvailabilitySlots { get; set; } = new List<AvailabilitySlot>();
    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
}
