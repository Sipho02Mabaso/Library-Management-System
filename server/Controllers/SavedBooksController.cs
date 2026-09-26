using LibraryManagementSystem.Core.DTOs;
using LibraryManagementSystem.Core.Interfaces;

namespace LibraryManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SavedBooksController : ControllerBase
{
    private readonly ISavedBookService _savedBookService;

    public SavedBooksController(ISavedBookService savedBookService)
    {
        _savedBookService = savedBookService;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<SavedBookDto>>> GetMySavedBooks()
    {
        var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
        if (userId == 0) return Unauthorized();
        var saved = await _savedBookService.GetMySavedBooksAsync(userId);
        return Ok(saved);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<bool>> SaveBook([FromBody] SaveBookDto dto)
    {
        var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
        var result = await _savedBookService.SaveBookAsync(dto.BookId, userId);
        if (!result) return BadRequest(new { Message = "Could not save book. Book may not exist or is already saved." });
        return Ok(new { Message = "Book saved to your reading list!" });
    }

    [HttpDelete("{bookId}")]
    [Authorize]
    public async Task<ActionResult<bool>> UnsaveBook(int bookId)
    {
        var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
        var result = await _savedBookService.UnsaveBookAsync(bookId, userId);
        if (!result) return NotFound();
        return Ok(new { Message = "Book removed from your reading list." });
    }
}
