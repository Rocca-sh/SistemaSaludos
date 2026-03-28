using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using SistemaSaludos.Modelo.Auth;
using SistemaSaludos.Service;

namespace SistemaSaludos.Controller;

[ApiController]
[Route("api/auth")]
public class LoginController : ControllerBase
{
    private readonly LoginService loginService; // Sin guion bajo

    public LoginController(LoginService loginService)
    {
        this.loginService = loginService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (request == null)
            return BadRequest(new { message = "Petición inválida" });

        var response = await loginService.AuthenticateAsync(request);

        if (response != null && !string.IsNullOrEmpty(response.token))
        {
            return Ok(new { token = response.token });
        }

        return Unauthorized(new { message = "Credenciales inválidas o error de conexión bd externa" });
    }
}
