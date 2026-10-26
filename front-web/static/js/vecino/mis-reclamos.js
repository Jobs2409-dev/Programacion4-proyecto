// front-web/static/js/vecino/mis-reclamos.js
import { API_BASE_URL, getAuthHeaders, logout } from '../config/config.js';

document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    cargarMisReclamos();
});

function verificarSesion() {
    const token = localStorage.getItem('access_token');
    const userRaw = localStorage.getItem('user_info');

    if (!token) {
        window.location.href = '/login/';
        return;
    }

    if (userRaw) {
        const user = JSON.parse(userRaw);
        const bienvenida = document.getElementById('vecino-bienvenida');
        if (bienvenida) {
            bienvenida.innerText = `Hola ${user.first_name || user.username}, desde acá podés realizar el seguimiento de tus reportes.`;
        }
    }
}

async function cargarMisReclamos() {
    const contenedor = document.getElementById('contenedor-mis-reclamos');
    if (!contenedor) return;

    try {
        // Consulta los reclamos del usuario autenticado en el backend
        const res = await fetch(`${API_BASE_URL}/reclamos/`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) throw new Error('Error al consultar mis reclamos');

        const data = await res.json();
        const reclamos = data.results || data;

        renderMisReclamos(reclamos, contenedor);
    } catch (err) {
        contenedor.innerHTML = `<p style="color: #ef4444;">No se pudieron cargar tus reclamos. Vuelve a iniciar sesión.</p>`;
    }
}

function renderMisReclamos(reclamos, contenedor) {
    if (reclamos.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p style="color: #64748b; margin-bottom: 1rem;">Aún no realizaste ningún reclamo municipal.</p>
                <a href="/nuevo-reclamo/" class="btn-nav-primary">Crear mi primer reclamo</a>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = reclamos.map(r => `
        <article class="tarjeta-reclamo-pub">
            <div class="tarjeta-pub-top">
                <span class="badge-categoria">${r.categoria ? r.categoria.nombre : 'General'}</span>
                <span style="font-size: 0.75rem; color: #64748b;">${new Date(r.fecha_creacion).toLocaleDateString('es-AR')}</span>
            </div>
            <h3 class="tarjeta-pub-titulo">#${r.id} — ${r.titulo}</h3>
            <p class="tarjeta-pub-desc">${r.descripcion}</p>
            <div class="tarjeta-pub-footer">
                <span style="font-size: 0.85rem; font-weight: bold; color: #1e40af;">
                    Estado: ${r.estado_actual ? r.estado_actual.nombre : 'Pendiente'}
                </span>
            </div>
        </article>
    `).join('');
}