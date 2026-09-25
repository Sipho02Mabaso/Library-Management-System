using LibraryManagementSystem.Core.DTOs;
using LibraryManagementSystem.Core.Interfaces;

namespace LibraryManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FinesController : ControllerBase
{
    private readonly IFineService _fineService;

    public FinesController(IFineService fineService)
    {
        _fineService = fineService;
    }

    [HttpGet("my-fines")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<FineDto>>> GetMyFines()
    {
        var userId = GetUserId();
        var fines = await _fineService.GetMyFinesAsync(userId);
        return Ok(fines);
    }

    [HttpPost("pay")]
    [Authorize]
    public async Task<ActionResult<bool>> PayFine([FromBody] PayFineDto dto)
    {
        var userId = GetUserId();
        var result = await _fineService.PayFineAsync(dto, userId);
        if (!result) return NotFound(new { Message = "Fine not found or already paid" });
        return Ok(new { Message = "Fine paid successfully" });
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<FineDto>>> GetAllFines()
    {
        var fines = await _fineService.GetAllFinesAsync();
        return Ok(fines);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<bool>> DeleteFine(int id)
    {
        var userId = GetUserId();
        var result = await _fineService.DeleteFineAsync(id, userId);
        if (!result) return NotFound();
        return Ok(new { Message = "Fine removed successfully" });
    }

    private int GetUserId() => int.Parse(User.FindFirst("userId")?.Value ?? "0");
}
