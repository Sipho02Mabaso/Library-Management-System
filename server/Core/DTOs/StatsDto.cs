namespace LibraryManagementSystem.Core.DTOs;

public class StatsDto
{
    public int TotalUsers { get; set; }
    public int TotalBooks { get; set; }
    public int TotalBorrows { get; set; }
    public int ActiveBorrows { get; set; }
    public int OverdueBorrows { get; set; }
    public int TotalRooms { get; set; }
    public int ActiveRoomBookings { get; set; }
    public int TotalSessions { get; set; }
    public decimal TotalFines { get; set; }
    public decimal OutstandingFines { get; set; }
    public int LibrarianCount { get; set; }
    public int AdminCount { get; set; }
}
