namespace SistemaSaludos.Modelo.Pantalla;

public class QueueItem
{
    public string  id       { get; set; } = "";
    public string  type     { get; set; } = "";  // "saludoVisitante" | "saludoGrupo" | "limpiar"
    public object? payload  { get; set; }
    public int?    visitId  { get; set; }
    public string? company  { get; set; }
}

public class Pantalla
{
    public string  idSig            { get; set; }
    public string  id               { get; set; }      // alias de idSig para el frontend
    public string  name             { get; set; }
    public string  location         { get; set; }      // nombre legible para el frontend
    public bool    state            { get; set; } = false;
    public string  status           => state ? "online" : "offline";
    public DateTime lastcon         { get; set; }
    public QueueItem? activeMessage { get; set; }
    public List<QueueItem> queue    { get; set; } = new();

    public Pantalla(string id, string name)
    {
        this.idSig    = id;
        this.id       = id;
        this.name     = name;
        this.location = name;
    }
}
