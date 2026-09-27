using LibraryManagementSystem.Core.DTOs;
using LibraryManagementSystem.Core.Interfaces;

namespace LibraryManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    private readonly ISessionService _sessionService;

    public SessionsController(ISessionService sessionService)
    {
        _sessionService = sessionService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<SessionDto>>> GetSessions([FromQuery] bool upcomingOnly = false)
    {
        var sessions = upcomingOnly
            ? await _sessionService.GetUpcomingAsync()
            : await _sessionService.GetAllAsync();
        return Ok(sessions);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<SessionDto>> GetSession(int id)
    {
        var session = await _sessionService.GetByIdAsync(id);
        if (session == null) return NotFound();
        return Ok(session);
    }

    [HttpPost]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<ActionResult<SessionDto>> CreateSession([FromBody] CreateSessionDto dto)
    {
        var userId = GetUserId();
        var session = await _sessionService.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetSession), new { id = session.SessionId }, session);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<ActionResult<SessionDto>> UpdateSession(int id, [FromBody] UpdateSessionDto dto)
    {
        var userId = GetUserId();
        try
        {
            var session = await _sessionService.UpdateAsync(id, dto, userId);
            if (session == null) return NotFound();
            return Ok(session);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Librarian,Admin")]
    public async Task<ActionResult<bool>> DeleteSession(int id)
    {
        var userId = GetUserId();
        var result = await _sessionService.DeleteAsync(id, userId);
        if (!result) return NotFound();
        return Ok(new { Message = "Session deactivated successfully" });
    }

    private int GetUserId() => int.Parse(User.FindFirst("userId")?.Value ?? "0");
}
