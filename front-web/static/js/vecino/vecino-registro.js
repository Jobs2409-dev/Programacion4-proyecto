// front-web/static/js/vecino/vecino-registro.js
// static/js/vecino/vecino-registro.js
import { API_BASE_URL } from '../config/config.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-vecino-registro');
    if (form) {
        form.addEventListener('submit', handleRegistro);
    }
});

async function handleRegistro(e) {
    e.preventDefault();

    const first_name = document.getElementById('first_name').value.trim();
    const last_name = document.getElementById('last_name').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const alerta = document.getElementById('alerta-error');
    const btn = document.getElementById('btn-registro');

    alerta.classList.add('oculta');
    btn.disabled = true;
    btn.innerText = 'Creando cuenta...';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email,
                password,
                first_name,
                last_name
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Muestra el detalle exacto de la validación devuelta por DRF
            const errorMsg = typeof data === 'object' ? JSON.stringify(data) : data.detail;
            throw new Error(errorMsg || 'Error al completar el registro.');
        }

        alert('¡Cuenta creada con éxito! Ahora podés iniciar sesión.');
        window.location.href = '/login/';

    } catch (err) {
        alerta.innerText = err.message;
        alerta.classList.remove('oculta');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Registrarme';
    }
}