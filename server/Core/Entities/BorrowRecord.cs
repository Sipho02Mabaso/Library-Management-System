using LibraryManagementSystem.Core.Enums;

namespace LibraryManagementSystem.Core.Entities;

public class BorrowRecord
{
    public int BorrowId { get; set; }
    public int UserId { get; set; }
    public int BookId { get; set; }
    public DateTime BorrowDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public BorrowStatus Status { get; set; } = BorrowStatus.Active;

    public User User { get; set; } = null!;
    public Book Book { get; set; } = null!;
    public Fine? Fine { get; set; }
}
