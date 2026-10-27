// front-web/static/js/vecino/vecino-portal.js
document.addEventListener('DOMContentLoaded', () => {
    const btnNuevoReclamo = document.getElementById('btn-crear-reclamo-portal');
    
    if (btnNuevoReclamo) {
        btnNuevoReclamo.addEventListener('click', (e) => {
            e.preventDefault();
            const token = localStorage.getItem('access_token');

            if (!token) {
                alert("Para registrar un reclamo municipal debés iniciar sesión o registrarte primero.");
                window.location.href = '/login/';
            } else {
                window.location.href = '/nuevo-reclamo/';
            }
        });
    }
});