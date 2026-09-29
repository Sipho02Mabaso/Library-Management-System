namespace LibraryManagementSystem.Core.Entities;

public class Book
{
    public int BookId { get; set; }
    public string Title { get; set; } = null!;
    public string Author { get; set; } = null!;
    public string ISBN { get; set; } = null!;
    public string? Genre { get; set; }
    public string ShelfLocation { get; set; } = null!;
    public int Quantity { get; set; }
    public int AvailableQuantity { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    public ICollection<BorrowRecord> BorrowRecords { get; set; } = new List<BorrowRecord>();
}
