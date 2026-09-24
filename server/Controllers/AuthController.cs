using LibraryManagementSystem.Core.DTOs;
using LibraryManagementSystem.Core.Interfaces;

namespace LibraryManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<User>> Register([FromBody] RegisterDto dto)
    {
        try
        {
            var user = await _authService.RegisterAsync(dto.Username, dto.Email, dto.Password, dto.FullName);
            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, new
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                CreatedAt = user.CreatedAt
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto dto)
    {
        try
        {
            var token = await _authService.LoginAsync(dto.Email, dto.Password);
            return Ok(new LoginResponseDto { Token = token, ExpiresIn = 3600 });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Message = ex.Message });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> Me()
    {
        var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
        if (userId == 0) return Unauthorized();

        var user = await _authService.GetByIdAsync(userId);
        if (user == null) return NotFound();

        return Ok(new UserDto
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            DebtBalance = user.DebtBalance,
            CreatedAt = user.CreatedAt,
            IsActive = user.IsActive
        });
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateUserDto dto)
    {
        var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
        if (userId == 0) return Unauthorized();

        var user = await _authService.GetByIdAsync(userId);
        if (user == null) return NotFound();

        if (dto.Username != null) user.Username = dto.Username;
        if (dto.Email != null) user.Email = dto.Email;
        if (dto.FullName != null) user.FullName = dto.FullName;

        if (dto.CurrentPassword != null && dto.NewPassword != null)
        {
            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return BadRequest(new { Message = "Current password is incorrect" });
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        }

        await _authService.UpdateAsync(user);
        return Ok(new UserDto
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            DebtBalance = user.DebtBalance,
            CreatedAt = user.CreatedAt,
            IsActive = user.IsActive
        });
    }

    [HttpGet("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        return Ok(new { Message = "Logged out successfully" });
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        var user = await _authService.GetByIdAsync(id);
        if (user == null) return NotFound();
        return Ok(new UserDto
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            DebtBalance = user.DebtBalance,
            CreatedAt = user.CreatedAt,
            IsActive = user.IsActive
        });
    }
}

public class LoginResponseDto
{
    public string Token { get; set; } = null!;
    public int ExpiresIn { get; set; }
}
