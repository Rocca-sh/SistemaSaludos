document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const togglePasswordIcon = document.getElementById('togglePasswordIcon');
    const loginError = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginSpinner = document.getElementById('loginSpinner');

    // Comprobar si ya está logueado, redirigir al panel si es así
    if (localStorage.getItem('auth_token')) {
        window.location.href = '/panel';
    }

    // Mostrar/ocultar contraseña
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Cambiar el icono
        if (type === 'text') {
            togglePasswordIcon.classList.remove('fa-eye');
            togglePasswordIcon.classList.add('fa-eye-slash');
        } else {
            togglePasswordIcon.classList.remove('fa-eye-slash');
            togglePasswordIcon.classList.add('fa-eye');
        }
    });

    // Manejar el envío del formulario
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Limpiar errores previos
        loginError.classList.add('d-none');
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showError("Por favor ingresa usuario y contraseña.");
            return;
        }

        // Mostrar estado de carga
        setLoading(true);

        try {
            // =========================================================
            // Lógica PENDIENTE DE API REAL
            // Aquí deberás hacer el fetch a la API real de autenticación
            // Ejemplo de cómo sería la llamada real:
            /*
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario: username, password: password })
            });

            if (!response.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data = await response.json();
            // Guardar token real
            localStorage.setItem('auth_token', data.token || 'mock_token');
            */
            // =========================================================

            // SIMULACIÓN DE LLAMADA API (Mock)
            // Simulamos un retardo de red de 1 segundo
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simulamos lógica básica (temporal)
            if (username === 'admin' && password === 'admin') {
                // Login exitoso
                localStorage.setItem('auth_token', 'token_temporal_simulado');
                window.location.replace('/panel'); // Redirigir usando replace para no guardar historial
            } else {
                // Error de login
                throw new Error('Usuario o contraseña incorrectos. (Usa admin/admin para probar)');
            }

        } catch (error) {
            console.error('Error en login:', error);
            showError(error.message || 'Error al intentar iniciar sesión.');
        } finally {
            // Restaurar estado del botón
            setLoading(false);
        }
    });

    function showError(message) {
        loginError.textContent = message;
        loginError.classList.remove('d-none');
        // Opcional: enfocar el input de password si hubo error
        passwordInput.focus();
    }

    function setLoading(isLoading) {
        if (isLoading) {
            loginBtnText.textContent = 'Verificando...';
            loginSpinner.classList.remove('d-none');
            loginBtn.disabled = true;
            usernameInput.disabled = true;
            passwordInput.disabled = true;
        } else {
            loginBtnText.textContent = 'Iniciar Sesión';
            loginSpinner.classList.add('d-none');
            loginBtn.disabled = false;
            usernameInput.disabled = false;
            passwordInput.disabled = false;
        }
    }
});
