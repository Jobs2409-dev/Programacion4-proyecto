// front-web/static/js/config.js
// URL por defecto para el backend de Python (DRF) o Node.js (Express)
export const API_BASE_URL = localStorage.getItem('selected_backend') || 'http://127.0.0.1:8000/api';

// ID del cliente
export const GOOGLE_CLIENT_ID = '826712144511-bmk2f2d8uqj3mq72gjcqsfk34r45su5r.apps.googleusercontent.com';

export function setBackend(url) {
    localStorage.setItem('selected_backend', url);
    window.location.reload();
}

export function getAuthHeaders(contentType = 'application/json') {
    const token = localStorage.getItem('access_token');
    const headers = {};
    if (contentType) headers['Content-Type'] = contentType;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

export function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    window.location.href = '/panel/login/';
}