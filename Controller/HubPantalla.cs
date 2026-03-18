namespace SistemaSaludos.Controller.HubPantalla;

using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;
using SistemaSaludos.Modelo.Pantalla;

public  class HubPantalla : Hub
{
    public static readonly ConcurrentDictionary<string , Pantalla> Pantallas = new ();
    public async Task<Pantalla> RegistrarPantalla(string nombre)
    {
        string id = Context.ConnectionId;
        Pantalla pantalla = new Pantalla(id, nombre);

        Pantallas[id] = pantalla;
        Console.WriteLine($"Pantalla conectada: {nombre}");
        await Clients.Caller.SendAsync("Registrada", nombre);

        return pantalla;
    }

    public async Task EnviarAPantalla(string id, string json)
    {
        if (!Pantallas.TryGetValue(id, out var pantalla))
        {
            Console.WriteLine($" No se encontró pantalla con id: {id}");
            return;
        }
    
        if (pantalla.state == false)
        {
            Console.WriteLine($"La pantalla '{pantalla.name}' está desconectada");
            return;
        }

        await Clients.Client(pantalla.idSig).SendAsync("ActualizarInfo", json);
        Console.WriteLine($"JSON enviado a '{pantalla.name}'");
    }

    public async Task EnviarATodas(string json)
    {
        await Clients.All.SendAsync("ActualizarInfo", json);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (Pantallas.TryGetValue(Context.ConnectionId, out var pantalla))
        {
            pantalla.state  = false;
            pantalla.lastcon = DateTime.Now;

            Console.WriteLine($"Pantalla desconectada: {pantalla.name} a las {pantalla.lastcon:HH:mm:ss}");
        }
        await base.OnDisconnectedAsync(exception);
    }

}