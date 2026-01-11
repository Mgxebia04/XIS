// AIModified:2026-01-11T14:58:01Z
namespace InterviewScheduling.API.Models;

public class OpenPosition
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Department { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public ICollection<Interviewee> Interviewees { get; set; } = new List<Interviewee>();
}
