using System.ComponentModel.DataAnnotations;

namespace InterviewScheduling.API.DTOs;

public class RequestPanelDto
{
    [Required(ErrorMessage = "Panel name is required")]
    [StringLength(255, MinimumLength = 2, ErrorMessage = "Panel name must be between 2 and 255 characters")]
    public string PanelName { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Panel email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
    public string PanelEmail { get; set; } = string.Empty;
    
    [StringLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters")]
    public string? Notes { get; set; }
}
