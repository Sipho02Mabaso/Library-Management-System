using LibraryManagementSystem.Core.Enums;

namespace LibraryManagementSystem.Core.Entities;

public class Fine
{
    public int FineId { get; set; }
    public int UserId { get; set; }
    public int BorrowId { get; set; }
    public decimal Amount { get; set; }
    public bool IsPaid { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }

    public User User { get; set; } = null!;
    public BorrowRecord BorrowRecord { get; set; } = null!;
}
