using LibraryManagementSystem.Core.Enums;

namespace LibraryManagementSystem.Core.DTOs;

public class RoomDto
{
    public int RoomId { get; set; }
    public string Name { get; set; } = null!;
    public int Capacity { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateRoomDto
    {
        public string Name { get; set; } = null!;
        public int Capacity { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class UpdateRoomDto
    {
        public string? Name { get; set; }
        public int? Capacity { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public bool? IsActive { get; set; }
    }

public class RoomBookingDto
{
    public int BookingId { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = null!;
    public int RoomId { get; set; }
    public string RoomName { get; set; } = null!;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public BookingStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateRoomBookingDto
{
    public int RoomId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}

public class AvailableSlotDto
{
    public int RoomId { get; set; }
    public string RoomName { get; set; } = null!;
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}
