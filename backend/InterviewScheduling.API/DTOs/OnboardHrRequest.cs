using System.ComponentModel.DataAnnotations;

namespace InterviewScheduling.API.DTOs;

public class OnboardHrRequest
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(255, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 255 characters")]
    public string Name { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
    public string Email { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Initial password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
    [StringLength(100, ErrorMessage = "Password cannot exceed 100 characters")]
    public string InitialPassword { get; set; } = string.Empty;
}
