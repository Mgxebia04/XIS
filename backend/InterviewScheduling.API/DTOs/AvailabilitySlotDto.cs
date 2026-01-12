// AIModified:2026-01-11T05:42:58Z
using System.ComponentModel.DataAnnotations;

namespace InterviewScheduling.API.DTOs;

public class AvailabilitySlotDto
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsAvailable { get; set; }
}

public class CreateAvailabilitySlotDto
{
    [Required(ErrorMessage = "Date is required")]
    public DateTime Date { get; set; }
    
    [Required(ErrorMessage = "Start time is required")]
    public TimeSpan StartTime { get; set; }
    
    [Required(ErrorMessage = "End time is required")]
    public TimeSpan EndTime { get; set; }
}
