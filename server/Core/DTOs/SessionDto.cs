using LibraryManagementSystem.Core.Enums;

namespace LibraryManagementSystem.Core.DTOs;

public class SessionDto
{
    public int SessionId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime Schedule { get; set; }
    public int DurationMinutes { get; set; }
    public int Capacity { get; set; }
    public int LibrarianId { get; set; }
    public string LibrarianName { get; set; } = null!;
    public int BookedCount { get; set; }
    public bool IsBookedByCurrentUser { get; set; }
    public string? ImageUrl { get; set; }
}

public class CreateSessionDto
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime Schedule { get; set; }
    public int DurationMinutes { get; set; } = 60;
    public int Capacity { get; set; } = 20;
    public string? ImageUrl { get; set; }
}

public class UpdateSessionDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? Schedule { get; set; }
    public int? DurationMinutes { get; set; }
    public int? Capacity { get; set; }
    public string? ImageUrl { get; set; }
    public bool? IsActive { get; set; }
}

public class SessionBookingDto
{
    public int BookingId { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = null!;
    public int SessionId { get; set; }
    public string SessionTitle { get; set; } = null!;
    public BookingStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSessionBookingDto
{
    public int SessionId { get; set; }
}
