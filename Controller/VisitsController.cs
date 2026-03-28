using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using SistemaSaludos.Modelo.Visit;
using SistemaSaludos.Service;

namespace SistemaSaludos.Controller;

[ApiController]
[Route("api/visits")]
public class VisitsController : ControllerBase
{
    private readonly VisitService visitService; // sin guion bajo

    public VisitsController(VisitService visitService)
    {
        this.visitService = visitService; // No se usa guion bajo ni la palabra base
    }

    // GET /api/visits
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await visitService.GetAllAsync());

    // GET /api/visits/today
    [HttpGet("today")]
    public async Task<IActionResult> GetToday() => Ok(await visitService.GetTodayAsync());

    // GET /api/visits/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var visit = await visitService.GetByIdAsync(id);
        if (visit == null) return NotFound();
        return Ok(visit);
    }

    // POST /api/visits
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Visit visit)
    {
        visit.source = "manual";
        var created = await visitService.AddAsync(visit);
        if (created == null) return BadRequest("No se pudo crear desde el endpoint externo");
        
        return CreatedAtAction(nameof(GetById), new { id = created.id }, created);
    }

    // POST /api/visits/sync
    [HttpPost("sync")]
    public async Task<IActionResult> SyncFromIdeeo()
    {
        var (synced, message) = await visitService.SyncFromIdeeoAsync();
        return Ok(new { synced, message });
    }
}
