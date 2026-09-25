using LibraryManagementSystem.Core.DTOs;
using LibraryManagementSystem.Core.Interfaces;

namespace LibraryManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LogsController : ControllerBase
{
    private readonly ILogService _logService;

    public LogsController(ILogService logService)
    {
        _logService = logService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<LogDto>>> GetLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var logs = await _logService.GetAllAsync(page, pageSize);
        return Ok(logs);
    }

    [HttpGet("user/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<LogDto>>> GetUserLogs(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var logs = await _logService.GetUserLogsAsync(userId, page, pageSize);
        return Ok(logs);
    }
}
