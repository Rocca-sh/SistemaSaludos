using SistemaSaludos.Modelo.Visit;

namespace SistemaSaludos.Service;

/// <summary>
/// Almacena visitas en memoria. Reemplaza la lista _visits
/// con una consulta a BD o a Ideeo cuando corresponda.
/// </summary>
public class VisitService
{
    private readonly List<Visit> _visits = new()
    {
        new Visit
        {
            id = 1, date = DateTime.Today.ToString("yyyy-MM-dd"),
            time = "10:00", durationMinutes = 30,
            company = "Empresa Ejemplo", host = "Ana López", area = "Sala A",
            source = "manual",
            visitors = new() { new Visitor { name = "Carlos Pérez", role = "Gerente" } }
        },
        new Visit
        {
            id = 2, date = DateTime.Today.ToString("yyyy-MM-dd"),
            time = "12:00", durationMinutes = 60,
            company = "Tech Corp", host = "Luis Martínez", area = "Sala B",
            source = "ideeo",
            visitors = new()
            {
                new Visitor { name = "María García", role = "CEO" },
                new Visitor { name = "Juan Ruiz",   role = "CTO" }
            }
        }
    };

    private int _nextId = 3;

    public List<Visit> GetAll()  => _visits;

    public List<Visit> GetToday()
    {
        var today = DateTime.Today.ToString("yyyy-MM-dd");
        return _visits.Where(v => v.date == today).ToList();
    }

    public Visit? GetById(int id) => _visits.FirstOrDefault(v => v.id == id);

    public Visit Add(Visit visit)
    {
        visit.id = _nextId++;
        _visits.Add(visit);
        return visit;
    }

    /// <summary>
    /// Simula sincronización con Ideeo.
    /// Reemplaza este método con la llamada HTTP real a Ideeo.
    /// </summary>
    public (int synced, string message) SyncFromIdeeo()
    {
        // TODO: llamar a la API de Ideeo y mapear las visitas
        return (0, "Sincronización pendiente de implementar con Ideeo");
    }
}
