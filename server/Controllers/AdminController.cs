using LibraryManagementSystem.Core.DTOs;
using LibraryManagementSystem.Core.Enums;
using LibraryManagementSystem.Core.Interfaces;

namespace LibraryManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("stats")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<StatsDto>> GetStats()
    {
        var stats = await _adminService.GetStatsAsync();
        return Ok(stats);
    }

    [HttpPost("users")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto dto)
    {
        try
        {
            var user = await _adminService.CreateUserAsync(dto, GetUserId());
            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpDelete("user/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<bool>> DeactivateUser(int id)
    {
        var adminId = GetUserId();
        var result = await _adminService.DeactivateUserAsync(id, adminId);
        if (!result) return NotFound();
        return Ok(new { Message = "User deactivated successfully" });
    }

    [HttpPut("user/{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<bool>> SetUserStatus(int id, [FromBody] UserStatusDto dto)
    {
        var result = await _adminService.SetUserActiveAsync(id, dto.IsActive, GetUserId());
        if (!result) return BadRequest(new { Message = "User was not found or cannot be blocked." });
        return Ok(new { Message = dto.IsActive ? "User unblocked successfully" : "User blocked successfully" });
    }

    private int GetUserId() => int.Parse(User.FindFirst("userId")?.Value ?? "0");
}

public class UserStatusDto
{
    public bool IsActive { get; set; }
}
