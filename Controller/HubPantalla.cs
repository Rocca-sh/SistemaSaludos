namespace SistemaSaludos.Controller.HubPantalla;

using Microsoft.AspNetCore.SignalR;
using SistemaSaludos.Modelo.Pantalla;
using SistemaSaludos.Service;

public class HubPantalla : Hub
{
    private readonly PantallaService _service;

    public HubPantalla(PantallaService service)
    {
        _service = service;
    }

    // La pantalla llama esto al conectarse para registrarse con un nombre
    public async Task<Pantalla> RegistrarPantalla(string nombre)
    {
        string id = Context.ConnectionId;

        var pantalla = new Pantalla(id, nombre) { state = true };
        _service.Pantallas[id] = pantalla;

        Console.WriteLine($"[HUB] Pantalla conectada: {nombre} ({id[..8]}...)");

        await Clients.Caller.SendAsync("Registrada", nombre);
        return pantalla;
    }

    // El panel recepcionista se une a su grupo para recibir ACKs
    public async Task JoinReceptionist()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "receptionist");
        Console.WriteLine($"[HUB] Panel recepcionista conectado ({Context.ConnectionId[..8]}...)");
    }

    // La pantalla confirma que recibió el mensaje
    public async Task AcknowledgeMessage(string messageId)
    {
        string id = Context.ConnectionId;
        Console.WriteLine($"[HUB] ACK de '{id[..8]}' para mensaje '{messageId}'");
        await Clients.Group("receptionist").SendAsync("MessageAcknowledged", id, messageId);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        string id = Context.ConnectionId;

        if (_service.Pantallas.TryGetValue(id, out var pantalla))
        {
            pantalla.state   = false;
            pantalla.lastcon = DateTime.Now;
            Console.WriteLine($"[HUB] Pantalla desconectada: {pantalla.name} a las {pantalla.lastcon:HH:mm:ss}");
        }

        await base.OnDisconnectedAsync(exception);
    }
}