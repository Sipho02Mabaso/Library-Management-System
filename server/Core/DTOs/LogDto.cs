using LibraryManagementSystem.Core.Enums;

namespace LibraryManagementSystem.Core.DTOs;

public class LogDto
{
    public int LogId { get; set; }
    public int? UserId { get; set; }
    public string? Username { get; set; }
    public LogAction Action { get; set; }
    public string EntityType { get; set; } = null!;
    public int? EntityId { get; set; }
    public string? Details { get; set; }
    public DateTime Timestamp { get; set; }
}
