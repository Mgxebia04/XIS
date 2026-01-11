namespace InterviewScheduling.API.DTOs;

public class PanelRequestDto
{
    public int Id { get; set; }
    public int RequestedByUserId { get; set; }
    public string RequestedByUserName { get; set; } = string.Empty;
    public string RequestedByUserEmail { get; set; } = string.Empty;
    public string PanelName { get; set; } = string.Empty;
    public string PanelEmail { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
}
