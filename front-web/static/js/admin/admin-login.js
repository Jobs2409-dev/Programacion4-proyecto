// front-web/static/js/admin/admin-login.js
import { API_BASE_URL, getAuthHeaders, logout } from '../config/config.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-admin-login');
    if (form) {
        form.addEventListener('submit', handleAdminLogin);
    }
});

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const alerta = document.getElementById('alerta-error');
    const btn = document.getElementById('btn-login');

    alerta.classList.add('oculta');
    btn.disabled = true;
    btn.innerText = 'Autenticando...';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Credenciales de administrador inválidas.');
        }

        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        const resMe = await fetch(`${API_BASE_URL}/auth/me/`, {
            headers: getAuthHeaders()
        });

        if (!resMe.ok) throw new Error('Error al verificar el perfil del usuario.');

        const perfil = await resMe.json();
        localStorage.setItem('user_info', JSON.stringify(perfil));

        const rol = perfil.rol ? perfil.rol.nombre : '';
        if (rol === 'ADMIN' || rol === 'OPERADOR') {
            window.location.href = '/panel/dashboard/';
        } else {
            logout();
            throw new Error('Acceso denegado: Se requieren permisos de administración.');
        }

    } catch (err) {
        alerta.innerText = err.message;
        alerta.classList.remove('oculta');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Ingresar al Panel';
    }
}