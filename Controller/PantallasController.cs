using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SistemaSaludos.Controller.HubPantalla;
using SistemaSaludos.Modelo.Pantalla;
using SistemaSaludos.Service;
using System.Text.Json;

[ApiController]
[Route("api/pantallas")]
public class PantallasController : ControllerBase
{
    private readonly IHubContext<HubPantalla> _hub;
    private readonly PantallaService _service;

    public PantallasController(IHubContext<HubPantalla> hub, PantallaService service)
    {
        _hub     = hub;
        _service = service;
    }

    // GET /api/pantallas/obtener
    [HttpGet("obtener")]
    public IActionResult Obtener()
    {
        var pantallas = _service.Pantallas.Values.ToList();
        return Ok(pantallas);
    }

    // POST /api/pantallas/enviar/{id}
    [HttpPost("enviar/{id}")]
    public async Task<IActionResult> Enviar(string id, [FromBody] MessageRequest req)
    {
        if (!_service.Pantallas.TryGetValue(id, out var pantalla))
            return NotFound(new { error = $"Pantalla '{id}' no encontrada" });

        if (!pantalla.state)
            return BadRequest(new { error = $"Pantalla '{pantalla.name}' está desconectada" });

        var json = JsonSerializer.Serialize(
            new { type = req.type, payload = req.payload, visitId = req.visitId },
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }
        );

        await _hub.Clients.Client(pantalla.idSig).SendAsync("ActualizarInfo", json);

        pantalla.activeMessage = new QueueItem
        {
            id      = Guid.NewGuid().ToString(),
            type    = req.type ?? "",
            payload = req.payload,
            visitId = req.visitId,
            company = req.payload is JsonElement el && el.TryGetProperty("empresa", out var emp)
                      ? emp.GetString() : null
        };

        Console.WriteLine($"[API] Mensaje '{req.type}' enviado a pantalla '{pantalla.name}'");
        return Ok(new { ok = true, ackReceived = true });
    }

    // POST /api/pantallas/broadcast
    [HttpPost("broadcast")]
    public async Task<IActionResult> Broadcast([FromBody] MessageRequest req)
    {
        var json = JsonSerializer.Serialize(
            new { type = req.type, payload = req.payload },
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }
        );

        await _hub.Clients.All.SendAsync("ActualizarInfo", json);
        Console.WriteLine($"[API] Broadcast '{req.type}' enviado a todas las pantallas");
        return Ok(new { ok = true });
    }

    // PUT /api/pantallas/{id}/queue
    [HttpPut("{id}/queue")]
    public IActionResult UpdateQueue(string id, [FromBody] QueueUpdateRequest req)
    {
        if (!_service.Pantallas.TryGetValue(id, out var pantalla))
            return NotFound(new { error = $"Pantalla '{id}' no encontrada" });

        pantalla.queue = req.queue ?? new List<QueueItem>();
        return Ok(new { ok = true });
    }
}

// ── DTOs ─────────────────────────────────────────────────────
public class MessageRequest
{
    public string?  type    { get; set; }
    public object?  payload { get; set; }
    public int?     visitId { get; set; }
}

public class QueueUpdateRequest
{
    public List<QueueItem>? queue { get; set; }
}