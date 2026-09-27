namespace LibraryManagementSystem.Core.DTOs;

public class FineDto
{
    public int FineId { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = null!;
    public string UserFullName { get; set; } = null!;
    public int BorrowId { get; set; }
    public string BookTitle { get; set; } = null!;
    public decimal Amount { get; set; }
    public bool IsPaid { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
}

public class PayFineDto
{
    public int FineId { get; set; }
}
