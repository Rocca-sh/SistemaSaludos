namespace SistemaSaludos.Modelo.Visit;

public class Visitor
{
    public string name { get; set; } = "";
    public string role { get; set; } = "";
}

public class Visit
{
    public int    id              { get; set; }
    public string date            { get; set; } = "";  // "yyyy-MM-dd"
    public string time            { get; set; } = "";  // "HH:mm"
    public int    durationMinutes { get; set; }
    public string company         { get; set; } = "";
    public string host            { get; set; } = "";
    public string area            { get; set; } = "";
    public string? logo           { get; set; }
    public string source          { get; set; } = "manual"; // "manual" | "ideeo"
    public List<Visitor> visitors { get; set; } = new();
}
