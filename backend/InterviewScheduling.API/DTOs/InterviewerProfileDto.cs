// AIModified:2026-01-11T05:42:58Z
using System.ComponentModel.DataAnnotations;

namespace InterviewScheduling.API.DTOs;

public class InterviewerProfileDto
{
    public int Id { get; set; }
    
    [StringLength(255, ErrorMessage = "Name cannot exceed 255 characters")]
    public string? Name { get; set; }
    
    [StringLength(500, ErrorMessage = "Profile picture URL cannot exceed 500 characters")]
    [Url(ErrorMessage = "Invalid URL format")]
    public string? ProfilePictureUrl { get; set; }
    
    [StringLength(50, ErrorMessage = "Experience cannot exceed 50 characters")]
    public string? Experience { get; set; }
    
    [StringLength(50, ErrorMessage = "Level cannot exceed 50 characters")]
    public string? Level { get; set; }
    
    public List<SkillDto> PrimarySkills { get; set; } = new();
    public List<SkillDto> SecondarySkills { get; set; } = new();
}

public class SkillDto
{
    [Required(ErrorMessage = "Skill ID is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Invalid skill ID")]
    public int Id { get; set; }
    
    [Required(ErrorMessage = "Skill name is required")]
    [StringLength(100, ErrorMessage = "Skill name cannot exceed 100 characters")]
    public string Name { get; set; } = string.Empty;
}
