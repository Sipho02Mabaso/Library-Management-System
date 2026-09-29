using LibraryManagementSystem.Core.Enums;

namespace LibraryManagementSystem.Core.Entities;

public class RoomBooking
{
    public int BookingId { get; set; }
    public int UserId { get; set; }
    public int RoomId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Confirmed;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Room Room { get; set; } = null!;
}
