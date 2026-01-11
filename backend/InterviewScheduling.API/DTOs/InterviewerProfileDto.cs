// AIModified:2026-01-11T05:42:58Z
namespace InterviewScheduling.API.DTOs;

public class InterviewerProfileDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? Experience { get; set; }
    public string? Level { get; set; }
    public List<SkillDto> PrimarySkills { get; set; } = new();
    public List<SkillDto> SecondarySkills { get; set; } = new();
}

public class SkillDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
