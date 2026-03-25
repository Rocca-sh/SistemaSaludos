using Microsoft.AspNetCore.Mvc;
using SistemaSaludos.Modelo.Visit;
using SistemaSaludos.Service;

[ApiController]
[Route("api/visits")]
public class VisitsController : ControllerBase
{
    private readonly VisitService _visitService;

    public VisitsController(VisitService visitService)
    {
        _visitService = visitService;
    }

    // GET /api/visits
    // Devuelve todas las visitas
    [HttpGet]
    public IActionResult GetAll() => Ok(_visitService.GetAll());

    // GET /api/visits/today
    // Devuelve solo las visitas de hoy
    [HttpGet("today")]
    public IActionResult GetToday() => Ok(_visitService.GetToday());

    // GET /api/visits/{id}
    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var visit = _visitService.GetById(id);
        if (visit == null) return NotFound();
        return Ok(visit);
    }

    // POST /api/visits
    // Crea una visita manual
    [HttpPost]
    public IActionResult Create([FromBody] Visit visit)
    {
        visit.source = "manual";
        var created = _visitService.Add(visit);
        return CreatedAtAction(nameof(GetById), new { id = created.id }, created);
    }

    // POST /api/visits/sync
    // Sincroniza visitas desde Ideeo
    [HttpPost("sync")]
    public IActionResult SyncFromIdeeo()
    {
        var (synced, message) = _visitService.SyncFromIdeeo();
        return Ok(new { synced, message });
    }
}
