using System.Collections.Concurrent;
using System.Threading;
using SistemaSaludos.Modelo.Pantalla;

namespace SistemaSaludos.Service;

public class PantallaService
{
    public ConcurrentDictionary<string, Pantalla> Pantallas { get; } = new();
    private int _pantallaCounter = 0;

    public int GetNextScreenNumber()
    {
        return Interlocked.Increment(ref _pantallaCounter);
    }
}
