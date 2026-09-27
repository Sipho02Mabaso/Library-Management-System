using LibraryManagementSystem.Core.Enums;

namespace LibraryManagementSystem.Core.DTOs;

public class BorrowDto
{
    public int BookId { get; set; }
    public DateTime? CustomDueDate { get; set; }
}

public class BorrowRecordDto
{
    public int BorrowId { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = null!;
    public string UserFullName { get; set; } = null!;
    public int BookId { get; set; }
    public string BookTitle { get; set; } = null!;
    public string BookAuthor { get; set; } = null!;
    public DateTime BorrowDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public BorrowStatus Status { get; set; }
    public decimal? FineAmount { get; set; }
    public bool IsFinePaid { get; set; }
}

public class ReturnDto
{
    public int BorrowId { get; set; }
}
