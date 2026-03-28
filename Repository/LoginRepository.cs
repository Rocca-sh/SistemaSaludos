using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using SistemaSaludos.Modelo.Auth;

namespace SistemaSaludos.Repository;

public class LoginRepository
{
    private readonly HttpClient httpClient; // Sin guion bajo
    private readonly IConfiguration configuration;

    public LoginRepository(HttpClient httpClient, IConfiguration configuration)
    {
        this.httpClient = httpClient;
        this.configuration = configuration;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        // === MODO DE PRUEBA: Si existe el archivo, devolver login exitoso simulado ===
        if (System.IO.File.Exists("mock_login.json"))
        {
            // Para la prueba, aceptaremos un usuario 'admin' y password 'admin'
            if (request.usuario == "admin" && request.password == "admin")
            {
                var mockContent = await System.IO.File.ReadAllTextAsync("mock_login.json");
                return System.Text.Json.JsonSerializer.Deserialize<LoginResponse>(mockContent, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            return null; // Credenciales inválidas
        }

        // Se lee la URL externa desde appsettings.json
        string url = configuration["ApiEndpoints:Login"] ?? "https://ideodbexterna.com/api/login";

        try
        {
            var response = await httpClient.PostAsJsonAsync(url, request);
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
                return result;
            }
        }
        catch (HttpRequestException)
        {
            // Omitimos manejo avanzado de errores por ahora, se puede loguear en el futuro
        }

        return null;
    }
}
