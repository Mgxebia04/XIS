// AIModified:2026-01-11T11:13:42Z
namespace InterviewScheduling.API.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // HR Manager, Interviewer
    public string? Name { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public InterviewerProfile? InterviewerProfile { get; set; }
}
