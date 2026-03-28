using System.Threading.Tasks;
using SistemaSaludos.Modelo.Auth;
using SistemaSaludos.Repository;

namespace SistemaSaludos.Service;

public class LoginService
{
    private readonly LoginRepository loginRepository; // Sin guion bajo

    public LoginService(LoginRepository loginRepository)
    {
        this.loginRepository = loginRepository;
    }

    public async Task<LoginResponse?> AuthenticateAsync(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.usuario) || string.IsNullOrWhiteSpace(request.password))
        {
            return null;
        }

        // Llamar al repositorio para que consuma en endpoint externo
        return await loginRepository.LoginAsync(request);
    }
}
