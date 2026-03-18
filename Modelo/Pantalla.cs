namespace SistemaSaludos.Modelo.Pantalla;
public class Pantalla
{
    public string idSig {get; set;}
    public string name  {get; set;}
    public bool state { get; set; } = false;
    public DateTime lastcon { get; set; }

    public Pantalla(string id, string name)
    {
        this.idSig = id;
        this.name = name;
    }
}