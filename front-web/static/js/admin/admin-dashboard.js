// front-web/static/js/admin/admin-dashboard.js
import { API_BASE_URL, getAuthHeaders, setBackend, logout } from '../config/config.js';

document.addEventListener('DOMContentLoaded', () => {
    verificarAcceso();
    cargarDatos();

    document.getElementById('btn-logout').addEventListener('click', logout);
    
    const selector = document.getElementById('backend-selector');
    selector.value = API_BASE_URL;
    selector.addEventListener('change', (e) => setBackend(e.target.value));

    document.getElementById('filtro-estado-admin').addEventListener('change', cargarDatos);
});

function verificarAcceso() {
    const token = localStorage.getItem('access_token');
    const userRaw = localStorage.getItem('user_info');

    if (!token || !userRaw) {
        window.location.href = '/panel/login/';
        return;
    }

    const user = JSON.parse(userRaw);
    const rol = user.rol ? user.rol.nombre : '';

    if (rol !== 'ADMIN' && rol !== 'OPERADOR') {
        alert('Acceso restringido a administradores.');
        logout();
        return;
    }

    document.getElementById('user-display').innerHTML = `👤 <strong>${user.first_name || user.username}</strong> (${rol})`;
}

async function cargarDatos() {
    const tbody = document.getElementById('tabla-reclamos-body');
    const estadoFiltro = document.getElementById('filtro-estado-admin').value;

    let url = `${API_BASE_URL}/reclamos/`;
    if (estadoFiltro) url += `?estado_actual=${estadoFiltro}`;

    try {
        const res = await fetch(url, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Error al consultar reclamos');

        const data = await res.json();
        const reclamos = data.results || data;

        actualizarMetricas(reclamos);
        renderTabla(reclamos, tbody);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" style="color: red;">Error al conectar con la API (${API_BASE_URL}).</td></tr>`;
    }
}

function renderTabla(reclamos, tbody) {
    if (reclamos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7">No hay reclamos registrados.</td></tr>`;
        return;
    }

    tbody.innerHTML = reclamos.map(r => `
        <tr>
            <td><strong>#${r.id}</strong></td>
            <td>
                <strong>${r.titulo}</strong><br>
                <span style="font-size: 0.75rem; color: #64748b;">${r.descripcion}</span>
            </td>
            <td>${r.categoria ? r.categoria.nombre : '-'}</td>
            <td>${r.usuario ? (r.usuario.first_name || r.usuario.username) : '-'}</td>
            <td>${new Date(r.fecha_creacion).toLocaleDateString('es-AR')}</td>
            <td><strong>${r.estado_actual.nombre}</strong></td>
            <td>
                <button class="btn-cambiar-estado" data-id="${r.id}" style="background: #2563eb; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                    Cambiar Estado
                </button>
            </td>
        </tr>
    `).join('');

    document.querySelectorAll('.btn-cambiar-estado').forEach(btn => {
        btn.addEventListener('click', (e) => cambiarEstadoModal(e.target.dataset.id));
    });
}

async function cambiarEstadoModal(reclamoId) {
    const nuevoEstado = prompt("Selecciona nuevo estado:\n1 = Pendiente\n2 = En Proceso\n3 = Resuelto\n4 = Rechazado");
    if (!nuevoEstado) return;

    const observacion = prompt("Ingrese una observación para el historial:");
    if (!observacion) return;

    try {
        const res = await fetch(`${API_BASE_URL}/reclamos/${reclamoId}/cambiar_estado/`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                nuevo_estado_id: parseInt(nuevoEstado),
                observacion: observacion
            })
        });

        if (res.ok) {
            alert('Estado actualizado correctamente.');
            cargarDatos();
        } else {
            const error = await res.json();
            alert(`Error: ${error.detail || 'No se pudo actualizar el estado'}`);
        }
    } catch (err) {
        alert('Error al conectar con la API.');
    }
}

function actualizarMetricas(reclamos) {
    document.getElementById('metric-total').innerText = reclamos.length;
    document.getElementById('metric-pendientes').innerText = reclamos.filter(r => r.estado_actual.id === 1).length;
    document.getElementById('metric-proceso').innerText = reclamos.filter(r => r.estado_actual.id === 2).length;
    document.getElementById('metric-resueltos').innerText = reclamos.filter(r => r.estado_actual.id === 3).length;
}