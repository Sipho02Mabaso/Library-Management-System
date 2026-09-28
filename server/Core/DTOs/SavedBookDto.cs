namespace LibraryManagementSystem.Core.DTOs;

public class SavedBookDto
{
    public int SavedBookId { get; set; }
    public int UserId { get; set; }
    public int BookId { get; set; }
    public string BookTitle { get; set; } = null!;
    public string BookAuthor { get; set; } = null!;
    public string? BookImageUrl { get; set; }
    public int AvailableQuantity { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
    public string? ShelfLocation { get; set; }
    public string? ISBN { get; set; }
    public DateTime SavedAt { get; set; }
}

public class SaveBookDto
{
    public int BookId { get; set; }
}
