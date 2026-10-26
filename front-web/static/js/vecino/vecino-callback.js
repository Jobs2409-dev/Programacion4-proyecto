// front-web/static/js/vecino/vecino-callback.js
document.addEventListener('DOMContentLoaded', () => {
    // Lee los parámetros 'access', 'refresh' y 'user' enviados por SocialLoginJWTView
    const urlParams = new URLSearchParams(window.location.search);
    const access = urlParams.get('access');
    const refresh = urlParams.get('refresh');
    const userRaw = urlParams.get('user');

    if (access && refresh) {
        // Almacena las credenciales JWT en el localStorage
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        
        if (userRaw) {
            localStorage.setItem('user_info', userRaw);
        }

        console.log("¡Autenticación con Google completada! Redirigiendo a Mis Reclamos...");
        // Redirige al panel privado del vecino
        window.location.href = '/mis-reclamos/';
    } else {
        const error = urlParams.get('error') || 'Error en el flujo de autenticación social.';
        alert('Ocurrió un error al iniciar sesión con Google: ' + error);
        window.location.href = '/login/';
    }
});