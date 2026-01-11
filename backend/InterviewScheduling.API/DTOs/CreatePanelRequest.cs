namespace InterviewScheduling.API.DTOs;

public class CreatePanelRequest
{
    public int PanelRequestId { get; set; }
    public string InitialPassword { get; set; } = string.Empty;
}
