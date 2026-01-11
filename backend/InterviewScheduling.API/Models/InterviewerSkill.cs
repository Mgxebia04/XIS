// AIModified:2026-01-11T05:42:58Z
namespace InterviewScheduling.API.Models;

public class InterviewerSkill
{
    public int Id { get; set; }
    public int InterviewerProfileId { get; set; }
    public int SkillId { get; set; }
    public bool IsPrimary { get; set; } // true for Primary Skills, false for Secondary Skills
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public InterviewerProfile InterviewerProfile { get; set; } = null!;
    public Skill Skill { get; set; } = null!;
}
