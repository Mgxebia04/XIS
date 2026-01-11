// AIModified:2026-01-11T05:42:58Z
namespace InterviewScheduling.API.Models;

public class Skill
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<InterviewerSkill> InterviewerSkills { get; set; } = new List<InterviewerSkill>();
    public ICollection<InterviewRequirement> InterviewRequirements { get; set; } = new List<InterviewRequirement>();
}
