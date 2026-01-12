using System.ComponentModel.DataAnnotations;

namespace InterviewScheduling.API.DTOs;

public class ChangePasswordRequest
{
    [Required(ErrorMessage = "Current password is required")]
    public string CurrentPassword { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "New password is required")]
    [MinLength(6, ErrorMessage = "New password must be at least 6 characters long")]
    [StringLength(100, ErrorMessage = "Password cannot exceed 100 characters")]
    public string NewPassword { get; set; } = string.Empty;
}
