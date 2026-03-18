using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SistemaSaludos.Controller.HubPantalla;

[ApiController]
[Route("api/pantallas")]
public class PantallasController : ControllerBase
{
    private readonly IHubContext<HubPantalla> hub;
    public PantallasController(IHubContext<HubPantalla> hub)
    {
        this.hub = hub;
    }

    [HttpPost("enviar/{id}")]
    public async Task<IActionResult> Enviar(string id, [FromBody] string json)
    {
        await hub.Clients.Client(id).SendAsync("ActualizarInfo", json);
        return Ok();
    }

    [HttpGet("obtener/")]
    public IActionResult Obtener()
    {
        var pantallas = HubPantalla.Pantallas.Values.ToList();
        return Ok(pantallas);
    }

}