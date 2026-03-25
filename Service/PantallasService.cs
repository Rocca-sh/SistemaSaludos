using System.Collections.Concurrent;
using SistemaSaludos.Modelo.Pantalla;

namespace SistemaSaludos.Service;

public class PantallaService
{
    public ConcurrentDictionary<string, Pantalla> Pantallas { get; } = new();
}
