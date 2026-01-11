namespace InterviewScheduling.API.Models;

public class PanelRequest
{
    public int Id { get; set; }
    public int RequestedByUserId { get; set; } // HR user who requested
    public string PanelName { get; set; } = string.Empty;
    public string PanelEmail { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string Status { get; set; } = "PENDING"; // PENDING, APPROVED, REJECTED
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
    public int? ProcessedByUserId { get; set; } // Admin user who processed
    
    // Navigation properties
    public User? RequestedByUser { get; set; }
    public User? ProcessedByUser { get; set; }
}
