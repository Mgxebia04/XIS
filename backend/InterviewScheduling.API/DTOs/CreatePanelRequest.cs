using System.ComponentModel.DataAnnotations;

namespace InterviewScheduling.API.DTOs;

public class CreatePanelRequest
{
    [Required(ErrorMessage = "Panel request ID is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Invalid panel request ID")]
    public int PanelRequestId { get; set; }
    
    [Required(ErrorMessage = "Initial password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
    [StringLength(100, ErrorMessage = "Password cannot exceed 100 characters")]
    public string InitialPassword { get; set; } = string.Empty;
}
