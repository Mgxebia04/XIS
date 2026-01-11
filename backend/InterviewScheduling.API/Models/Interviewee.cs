// AIModified:2026-01-11T14:58:01Z
namespace InterviewScheduling.API.Models;

public class Interviewee
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
    public string? PrimarySkill { get; set; }
    public int? PositionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public OpenPosition? Position { get; set; }
    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
}
