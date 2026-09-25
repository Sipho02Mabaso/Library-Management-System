using LibraryManagementSystem.Core.Interfaces;

namespace LibraryManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("{type}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<byte[]>> GenerateReport(string type)
    {
        var validTypes = new[] { "borrows", "fines", "rooms", "users", "sessions", "logs", "activity" };
        if (!validTypes.Contains(type.ToLower()))
            return BadRequest(new { Message = "Invalid report type" });

        var bytes = await _reportService.GenerateCsvAsync(type);

        return File(bytes, "text/csv", $"library-report-{type}-{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }
}
