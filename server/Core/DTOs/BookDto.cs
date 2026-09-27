namespace LibraryManagementSystem.Core.DTOs;

public class BookDto
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
    public DateTime CreatedAt { get; set;}
    public bool IsActive { get; set; }
}

public class CreateBookDto
{
    public string Title { get; set; } = null!;
    public string Author { get; set; } = null!;
    public string ISBN { get; set; } = null!;
    public string? Genre { get; set; }
    public string ShelfLocation { get; set; } = null!;
    public int Quantity { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
}

public class UpdateBookDto
{
    public string? Title { get; set; }
    public string? Author { get; set; }
    public string? ISBN { get; set; }
    public string? Genre { get; set; }
    public string? ShelfLocation { get; set; }
    public int? Quantity { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public bool? IsActive { get; set; }
}
