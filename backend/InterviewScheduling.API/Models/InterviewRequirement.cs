// AIModified:2026-01-11T05:42:58Z
namespace InterviewScheduling.API.Models;

public class InterviewRequirement
{
    public int Id { get; set; }
    public int InterviewId { get; set; }
    public int SkillId { get; set; }
    public bool IsPrimary { get; set; } // true for Primary Skills, false for Secondary Skills
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Interview Interview { get; set; } = null!;
    public Skill Skill { get; set; } = null!;
}
