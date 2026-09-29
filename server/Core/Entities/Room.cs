namespace LibraryManagementSystem.Core.Entities;

public class Room
{
    public int RoomId { get; set; }
    public string Name { get; set; } = null!;
    public int Capacity { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<RoomBooking> RoomBookings { get; set; } = new List<RoomBooking>();
}
