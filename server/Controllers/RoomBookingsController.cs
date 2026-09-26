using LibraryManagementSystem.Core.DTOs;
using LibraryManagementSystem.Core.Interfaces;

namespace LibraryManagementSystem.Controllers;

[ApiController]
[Route("api/room-bookings")]
public class RoomBookingsController : ControllerBase
{
    private readonly IRoomBookingService _roomBookingService;

    public RoomBookingsController(IRoomBookingService roomBookingService)
    {
        _roomBookingService = roomBookingService;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<RoomBookingDto>> BookRoom([FromBody] CreateRoomBookingDto dto)
    {
        var userId = GetUserId();
        try
        {
            var booking = await _roomBookingService.BookRoomAsync(dto, userId);
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
        var result = await _roomBookingService.CancelBookingAsync(id, userId);
        if (!result) return NotFound(new { Message = "Booking not found or doesn't belong to you" });
        return Ok(new { Message = "Booking cancelled successfully" });
    }

    [HttpGet("my-bookings")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<RoomBookingDto>>> GetMyBookings()
    {
        var userId = GetUserId();
        var bookings = await _roomBookingService.GetMyBookingsAsync(userId);
        return Ok(bookings);
    }

    [HttpGet("room/{id}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<ActionResult<IEnumerable<RoomBookingDto>>> GetRoomBookings(int id)
    {
        var bookings = await _roomBookingService.GetRoomBookingsAsync(id);
        return Ok(bookings);
    }

    [HttpGet("available/{roomId}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<AvailableSlotDto>>> GetAvailableSlots(int roomId, [FromQuery] DateTime date)
    {
        var slots = await _roomBookingService.GetAvailableSlotsAsync(roomId, date);
        return Ok(slots);
    }

    [HttpDelete("{id}/cancel")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<ActionResult<bool>> RemoveBooking(int id)
    {
        var userId = GetUserId();
        var result = await _roomBookingService.RemoveBookingAsync(id, userId);
        if (!result) return NotFound();
        return Ok(new { Message = "Booking removed successfully" });
    }

    private int GetUserId() => int.Parse(User.FindFirst("userId")?.Value ?? "0");
}
