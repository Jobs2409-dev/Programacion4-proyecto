document.addEventListener('DOMContentLoaded', () => {
    actualizarHeaderSesion();
});

function actualizarHeaderSesion() {
    const contenedorHeader = document.getElementById('header-usuario-panel');
    if (!contenedorHeader) return;

    const token = localStorage.getItem('access_token');
    const userRaw = localStorage.getItem('user_info');

    if (token && userRaw) {
        try {
            const user = JSON.parse(userRaw);
            const nombreMostrar = user.first_name 
                ? `${user.first_name} ${user.last_name || ''}`.trim() 
                : user.username;

            contenedorHeader.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <a href="/mis-reclamos/" style="color: #60a5fa; text-decoration: none; font-size: 0.9rem; font-weight: 600;">
                        📋 Mis Reclamos
                    </a>
                    <span style="color: white; font-size: 0.9rem; font-weight: 600;">
                        👤 ${nombreMostrar}
                    </span>
                    <button id="btn-logout" style="background-color: #ef4444; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
                        Cerrar sesión
                    </button>
                </div>
            `;

            document.getElementById('btn-logout').addEventListener('click', cerrarSesion);
        } catch (e) {
            console.error("Error al parsear user_info:", e);
            mostrarEstadoAnonimo(contenedorHeader);
        }
    } else {
        mostrarEstadoAnonimo(contenedorHeader);
    }
}

function mostrarEstadoAnonimo(contenedor) {
    contenedor.innerHTML = `
        <a href="/login/" style="color: white; border: 1px solid #475569; padding: 0.4rem 0.8rem; border-radius: 6px; text-decoration: none; font-size: 0.85rem;">Ingresar</a>
        <a href="/login/" style="background-color: #2563eb; color: white; padding: 0.4rem 0.8rem; border-radius: 6px; text-decoration: none; font-size: 0.85rem; margin-left: 0.5rem;">Registrarse</a>
    `;
}

function cerrarSesion() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');

    alert("Sesión cerrada correctamente.");
    window.location.href = '/';
}