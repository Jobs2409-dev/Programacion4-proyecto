// front-web/static/js/vecino/vecino-login.js
import { API_BASE_URL } from '../config/config.js';

// Asignación explícita al objeto window para el callback HTML de Google
window.handleGoogleLogin = async function(response) {
    console.log("Token obtenido de Google con éxito:", response.credential);

    const alerta = document.getElementById('alerta-error');
    if (alerta) alerta.classList.add('oculta');

    try {
        const res = await fetch(`${API_BASE_URL}/auth/google/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: response.credential })
        });

        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.detail || 'Error al autenticar con el servidor.');
        }

        // Guardar Tokens JWT en localStorage
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        if (data.user) {
            localStorage.setItem('user_info', JSON.stringify(data.user));
        }

        console.log("¡Usuario autenticado/creado en la base de datos! Redirigiendo...");
        window.location.href = '/mis-reclamos/';

    } catch (err) {
        if (alerta) {
            alerta.innerText = err.message;
            alerta.classList.remove('oculta');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-vecino-login');
    if (form) {
        form.addEventListener('submit', handleLocalLogin);
    }
});

async function handleLocalLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const alerta = document.getElementById('alerta-error');

    if (alerta) alerta.classList.add('oculta');

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Credenciales inválidas');

        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        window.location.href = '/mis-reclamos/';
    } catch (err) {
        if (alerta) {
            alerta.innerText = err.message;
            alerta.classList.remove('oculta');
        }
    }
}