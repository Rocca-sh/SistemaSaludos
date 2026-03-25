using SistemaSaludos.Controller.HubPantalla;
using SistemaSaludos.Service;

var builder = WebApplication.CreateBuilder(args);

// ── Servicios ────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        opts.JsonSerializerOptions.DictionaryKeyPolicy  = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddSignalR();
builder.Services.AddSingleton<PantallaService>();
builder.Services.AddSingleton<VisitService>();

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

// ── Rutas de páginas ─────────────────────────────────────────

// Redirige la raíz al panel recepcionista
app.MapGet("/", () => Results.Redirect("/panel"));

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
app.MapControllers();
app.MapHub<HubPantalla>("/hub");

app.Run();