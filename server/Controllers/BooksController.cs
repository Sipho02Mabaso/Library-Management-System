using LibraryManagementSystem.Core.DTOs;
using LibraryManagementSystem.Core.Enums;
using LibraryManagementSystem.Core.Interfaces;

namespace LibraryManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;

    public BooksController(IBookService bookService)
    {
        _bookService = bookService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks()
    {
        var books = await _bookService.GetAllAsync();
        return Ok(books);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<BookDto>> GetBook(int id)
    {
        var book = await _bookService.GetByIdAsync(id);
        if (book == null) return NotFound();
        return Ok(book);
    }

    [HttpGet("{id}/borrow-history")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<ActionResult<IEnumerable<BorrowRecordDto>>> GetBorrowHistory(int id)
    {
        var history = await _bookService.GetBorrowHistoryAsync(id);
        return Ok(history);
    }

    [HttpPost]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<ActionResult<BookDto>> CreateBook([FromBody] CreateBookDto dto)
    {
        var userId = GetUserId();
        try
        {
            var book = await _bookService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetBook), new { id = book.BookId }, book);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<ActionResult<BookDto>> UpdateBook(int id, [FromBody] UpdateBookDto dto)
    {
        var userId = GetUserId();
        try
        {
            var book = await _bookService.UpdateAsync(id, dto, userId);
            if (book == null) return NotFound();
            return Ok(book);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<ActionResult<bool>> DeleteBook(int id)
    {
        var userId = GetUserId();
        var result = await _bookService.DeleteAsync(id, userId);
        if (!result) return NotFound();
        return Ok(new { Message = "Book deactivated successfully" });
    }

    private int GetUserId() => int.Parse(User.FindFirst("userId")?.Value ?? "0");
}
