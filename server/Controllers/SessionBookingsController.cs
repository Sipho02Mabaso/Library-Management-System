using LibraryManagementSystem.Core.DTOs;
using LibraryManagementSystem.Core.Interfaces;

namespace LibraryManagementSystem.Controllers;

[ApiController]
[Route("api/session-bookings")]
public class SessionBookingsController : ControllerBase
{
    private readonly ISessionBookingService _sessionBookingService;

    public SessionBookingsController(ISessionBookingService sessionBookingService)
    {
        _sessionBookingService = sessionBookingService;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<SessionBookingDto>> BookSession([FromBody] CreateSessionBookingDto dto)
    {
        var userId = GetUserId();
        try
        {
            var booking = await _sessionBookingService.BookSessionAsync(dto, userId);
            return Ok(booking);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult<bool>> CancelBooking(int id)
    {
        var userId = GetUserId();
        var result = await _sessionBookingService.CancelBookingAsync(id, userId);
        if (!result) return NotFound(new { Message = "Booking not found or doesn't belong to you" });
        return Ok(new { Message = "Booking cancelled successfully" });
    }

    [HttpGet("my-bookings")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<SessionBookingDto>>> GetMyBookings()
    {
        var userId = GetUserId();
        var bookings = await _sessionBookingService.GetMyBookingsAsync(userId);
        return Ok(bookings);
    }

    private int GetUserId() => int.Parse(User.FindFirst("userId")?.Value ?? "0");
}
