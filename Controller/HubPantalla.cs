using Microsoft.AspNetCore.SignalR;

public  class HubPantalla : Hub
{
    private static readonly Dictionary<string , string> Pantallas = new ();

    public async Task RegistrarPantalla(string nombre)
    {
        Pantallas[Context.ConnectionId] = nombre;
        Console.WriteLine($"Pantalla conectada: {nombre}");

        await Clients.Caller.SendAsync("Registrada", nombre);
    }

    public async Task EnviarAPantalla(string nombrePantalla, object datos)
    {
        var id = Pantallas.FirstOrDefault(p => p.Value == nombrePantalla).Key;
        if (id != null)
            await Clients.Client(id).SendAsync("ActualizarInfo", datos);
    }

    public async Task EnviarATodas(object datos)
    {
        await Clients.All.SendAsync("ActualizarInfo", datos);
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        return base.OnDisconnectedAsync(exception);
    }
}