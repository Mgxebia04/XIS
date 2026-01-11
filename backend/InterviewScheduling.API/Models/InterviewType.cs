// AIModified:2026-01-11T05:42:58Z
namespace InterviewScheduling.API.Models;

public class InterviewType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // e.g., "L1 - Initial Screening"
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
}
