using LibraryManagementSystem.Core.DTOs;
using LibraryManagementSystem.Core.Interfaces;

namespace LibraryManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BorrowsController : ControllerBase
{
    private readonly IBorrowService _borrowService;

    public BorrowsController(IBorrowService borrowService)
    {
        _borrowService = borrowService;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<BorrowRecordDto>> BorrowBook([FromBody] BorrowDto dto)
    {
        var userId = GetUserId();
        try
        {
            var record = await _borrowService.BorrowBookAsync(dto, userId);
            return Ok(record);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("return")]
    [Authorize]
    public async Task<ActionResult<bool>> ReturnBook([FromBody] ReturnDto dto)
    {
        var userId = GetUserId();
        var result = await _borrowService.ReturnBookAsync(dto, userId);
        if (!result) return NotFound(new { Message = "Borrow record not found or not active" });
        return Ok(new { Message = "Book returned successfully" });
    }

    [HttpGet("my-borrows")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<BorrowRecordDto>>> GetMyBorrows()
    {
        var userId = GetUserId();
        var borrows = await _borrowService.GetMyActiveBorrowsAsync(userId);
        return Ok(borrows);
    }

    [HttpGet("overdue")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<ActionResult<IEnumerable<BorrowRecordDto>>> GetOverdue()
    {
        var overdue = await _borrowService.GetOverdueAsync();
        return Ok(overdue);
    }

    [HttpGet("{id}/fine")]
    [Authorize]
    public async Task<ActionResult<FineDto?>> GetFine(int id)
    {
        var userId = GetUserId();
        var fine = await _borrowService.GetFineForBorrowAsync(id, userId);
        if (fine == null) return NotFound(new { Message = "No fine for this borrow record" });
        return Ok(fine);
    }

    private int GetUserId() => int.Parse(User.FindFirst("userId")?.Value ?? "0");
}
