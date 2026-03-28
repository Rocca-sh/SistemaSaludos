using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using SistemaSaludos.Modelo.Visit;

namespace SistemaSaludos.Repository;

public class VisitRepository
{
    private readonly HttpClient httpClient; // Sin guion bajo
    private readonly IConfiguration configuration;

    public VisitRepository(HttpClient httpClient, IConfiguration configuration)
    {
        this.httpClient = httpClient;
        this.configuration = configuration;
    }

    private string GetUrl(string endpoint = "")
    {
        var baseUrl = configuration["ApiEndpoints:Visits"] ?? "https://midbexterna.com/api/visits";
        return string.IsNullOrEmpty(endpoint) ? baseUrl : $"{baseUrl}/{endpoint}";
    }

    public async Task<List<Visit>> GetAllAsync()
    {
        // === MODO DE PRUEBA: Si existe el archivo, devolver registros simulados ===
        if (System.IO.File.Exists("mock_visits.json"))
        {
            var mockContent = await System.IO.File.ReadAllTextAsync("mock_visits.json");
            var mockItems = System.Text.Json.JsonSerializer.Deserialize<List<Visit>>(mockContent, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return mockItems ?? new List<Visit>();
        }

        string url = GetUrl();
        try
        {
            var response = await httpClient.GetAsync(url);
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<List<Visit>>();
                return result ?? new List<Visit>();
            }
        }
        catch (HttpRequestException)
        {
            // Log warning si es necesario
        }
        return new List<Visit>();
    }

    public async Task<Visit?> GetByIdAsync(int id)
    {
        // === MODO DE PRUEBA: Si existe el archivo, devolver registros simulados ===
        if (System.IO.File.Exists("mock_visits.json"))
        {
            var mockContent = await System.IO.File.ReadAllTextAsync("mock_visits.json");
            var mockItems = System.Text.Json.JsonSerializer.Deserialize<List<Visit>>(mockContent, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return mockItems?.Find(v => v.id == id);
        }

        string url = GetUrl(id.ToString());
        try
        {
            var response = await httpClient.GetAsync(url);
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<Visit>();
            }
        }
        catch (HttpRequestException) { }

        return null;
    }

    public async Task<Visit?> AddAsync(Visit visit)
    {
        // === MODO DE PRUEBA: Si existe el archivo mock_visits.json, lo usamos ===
        if (System.IO.File.Exists("mock_visits.json"))
        {
            var mockContent = await System.IO.File.ReadAllTextAsync("mock_visits.json");
            var mockItems = System.Text.Json.JsonSerializer.Deserialize<List<Visit>>(mockContent, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<Visit>();

            visit.id = (mockItems.Count > 0 ? System.Linq.Enumerable.Max(mockItems, v => v.id) : 0) + 1;
            mockItems.Add(visit);

            await System.IO.File.WriteAllTextAsync("mock_visits.json", System.Text.Json.JsonSerializer.Serialize(mockItems, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));

            return visit;
        }

        string url = GetUrl();
        try
        {
            var response = await httpClient.PostAsJsonAsync(url, visit);
            if (response.IsSuccessStatusCode)
            {
                // Algunas API regresan el recurso creado
                return await response.Content.ReadFromJsonAsync<Visit>();
            }
        }
        catch (HttpRequestException) { }

        return null;
    }

    public async Task<(int synced, string message)> SyncFromIdeeoAsync()
    {
        // Llamada a API de Ideeo
        string url = GetUrl("sync");
        try
        {
            var response = await httpClient.PostAsync(url, null);
            if (response.IsSuccessStatusCode)
            {
                return (1, "Sincronizado vía repositorio externo a backend DB");
            }
        }
        catch (HttpRequestException) { }

        return (0, "Error en Sincronización con endpoint externo");
    }
}
