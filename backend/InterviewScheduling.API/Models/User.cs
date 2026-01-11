// AIModified:2026-01-11T05:42:58Z
namespace InterviewScheduling.API.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // HR Manager, Interviewer
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public InterviewerProfile? InterviewerProfile { get; set; }
}
