using SistemaSaludos.Controller.HubPantalla;
using SistemaSaludos.Service;
using SistemaSaludos.Repository;

var builder = WebApplication.CreateBuilder(args);

// ── Servicios ────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        opts.JsonSerializerOptions.DictionaryKeyPolicy  = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddSignalR();
builder.Services.AddHttpClient();

builder.Services.AddSingleton<PantallaService>();

builder.Services.AddScoped<LoginRepository>();
builder.Services.AddScoped<LoginService>();
builder.Services.AddScoped<VisitRepository>();
builder.Services.AddScoped<VisitService>();

// CORS: AllowAnyOrigin() NO funciona con SignalR (bloquea credentials)
// SetIsOriginAllowed acepta cualquier origen y permite AllowCredentials
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(_ => true)   // acepta cualquier IP/origen
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();              // requerido por SignalR
    });
});

var app = builder.Build();

// ── Middleware ───────────────────────────────────────────────
app.UseCors();
app.UseStaticFiles(); // sirve wwwroot/ (css, js, imágenes, etc.)

// Mapea la carpeta original "logo" para que sea accesible públicamente en la URL /logo/...
var logoPath = Path.Combine(builder.Environment.ContentRootPath, "logo");
if (!System.IO.Directory.Exists(logoPath))
{
    System.IO.Directory.CreateDirectory(logoPath);
}
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(logoPath),
    RequestPath = "/logo"
});

// ── Rutas de páginas ─────────────────────────────────────────

// Redirige la raíz al login
app.MapGet("/", () => Results.Redirect("/login"));

// Login page
app.MapGet("/login", async (HttpContext ctx) =>
{
    ctx.Response.ContentType = "text/html";
    await ctx.Response.SendFileAsync("wwwroot/login.html");
});

// Panel recepcionista (tu index.html actual)
app.MapGet("/panel", async (HttpContext ctx) =>
{
    ctx.Response.ContentType = "text/html";
    await ctx.Response.SendFileAsync("wwwroot/index.html");
});

// Pantalla Android / display
app.MapGet("/pantalla", async (HttpContext ctx) =>
{
    ctx.Response.ContentType = "text/html";
    await ctx.Response.SendFileAsync("wwwroot/pantalla-android.html");
});

// Ruta para tablets/dispositivos Android antiguos (Android 7, WebView básico)
app.MapGet("/pantalla-legacy", async (HttpContext ctx) =>
{
    ctx.Response.ContentType = "text/html";
    await ctx.Response.SendFileAsync("wwwroot/pantalla-legacy.html");
});

// ── API y SignalR ─────────────────────────────────────────────

app.MapGet("/api/greetings", () =>
{
    var path = Path.Combine(builder.Environment.ContentRootPath, "greetings.json");
    if (!System.IO.File.Exists(path))
    {
        return Results.Ok(new string[] { "¡Bienvenidos a AutoZone!", "Encuentra todo para tu auto" });
    }
    return Results.Content(System.IO.File.ReadAllText(path), "application/json");
});

app.MapPost("/api/greetings", async (HttpContext ctx) =>
{
    using var reader = new StreamReader(ctx.Request.Body);
    var body = await reader.ReadToEndAsync();
    var path = Path.Combine(builder.Environment.ContentRootPath, "greetings.json");
    
    var list = new System.Collections.Generic.List<string>();
    if (System.IO.File.Exists(path))
    {
        list = System.Text.Json.JsonSerializer.Deserialize<System.Collections.Generic.List<string>>(System.IO.File.ReadAllText(path)) ?? list;
    }
    
    try {
        var bodyJson = System.Text.Json.JsonDocument.Parse(body);
        if (bodyJson.RootElement.TryGetProperty("texto", out var textEl)) {
            var nuevo = textEl.GetString();
            if (!string.IsNullOrWhiteSpace(nuevo) && !list.Contains(nuevo))
            {
                list.Add(nuevo);
                System.IO.File.WriteAllText(path, System.Text.Json.JsonSerializer.Serialize(list));
            }
        }
    } catch { }

    return Results.Ok(list);
});

app.MapDelete("/api/greetings/{index:int}", (int index) =>
{
    var path = Path.Combine(builder.Environment.ContentRootPath, "greetings.json");
    if (!System.IO.File.Exists(path)) return Results.NotFound();
    var list = System.Text.Json.JsonSerializer.Deserialize<System.Collections.Generic.List<string>>(System.IO.File.ReadAllText(path));
    if (list != null && index >= 0 && index < list.Count)
    {
        list.RemoveAt(index);
        System.IO.File.WriteAllText(path, System.Text.Json.JsonSerializer.Serialize(list));
        return Results.Ok(list);
    }
    return Results.BadRequest(new { error = "Índice inválido" });
});

app.MapControllers();
app.MapHub<HubPantalla>("/hub");
app.Lifetime.ApplicationStarted.Register(() =>
{
    var url = "http://localhost:5000/login";
    try
    {
        System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
        {
            FileName = url,
            UseShellExecute = true
        });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error al abrir el navegador: {ex.Message}");
    }
});

app.Run();