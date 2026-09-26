using LibraryManagementSystem.Core.DTOs;
using LibraryManagementSystem.Core.Interfaces;

namespace LibraryManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly IRoomService _roomService;

    public RoomsController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetRooms()
    {
        var rooms = await _roomService.GetAllAsync();
        return Ok(rooms);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<RoomDto>> GetRoom(int id)
    {
        var room = await _roomService.GetByIdAsync(id);
        if (room == null) return NotFound();
        return Ok(room);
    }

    [HttpPost]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<ActionResult<RoomDto>> CreateRoom([FromBody] CreateRoomDto dto)
    {
        var userId = GetUserId();
        var room = await _roomService.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetRoom), new { id = room.RoomId }, room);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<ActionResult<RoomDto>> UpdateRoom(int id, [FromBody] UpdateRoomDto dto)
    {
        var userId = GetUserId();
        var room = await _roomService.UpdateAsync(id, dto, userId);
        if (room == null) return NotFound();
        return Ok(room);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<ActionResult<bool>> DeleteRoom(int id)
    {
        var userId = GetUserId();
        var result = await _roomService.DeleteAsync(id, userId);
        if (!result) return NotFound();
        return Ok(new { Message = "Room deactivated successfully" });
    }

    private int GetUserId() => int.Parse(User.FindFirst("userId")?.Value ?? "0");
}
