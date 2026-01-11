// AIModified:2026-01-11T16:22:15Z
namespace InterviewScheduling.API.DTOs;

public class LoginResponse
{
    public int UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int? InterviewerProfileId { get; set; }
}
