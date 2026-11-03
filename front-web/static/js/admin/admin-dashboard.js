// front-web/static/js/admin/admin-dashboard.js
import { API_BASE_URL, getAuthHeaders, logout } from '../config/config.js';
import { inicializarModuloOperadores, cargarVistaOperadores } from './admin-operadores.js';

let modalEstadoInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    verificarAcceso();
    cargarMetricasIniciales();

    // Toggle para la Sidebar Lateral
    const btnToggle = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.getElementById('admin-sidebar');
    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', () => {
            sidebar.classList.toggle('closed');
        });
    }

    // Botón Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.addEventListener('click', logout);

    // Click en la marca superior para volver al dashboard
    document.getElementById('brand-home').addEventListener('click', () => {
        mostrarVistaDashboard();
    });

    // Botón "← Volver al Resumen"
    const btnVolver = document.getElementById('btn-volver-dashboard');
    if (btnVolver) {
        btnVolver.addEventListener('click', mostrarVistaDashboard);
    }

    // Listener para el envío del formulario del modal de estado
    const formEstado = document.getElementById('form-cambiar-estado');
    if (formEstado) {
        formEstado.addEventListener('submit', guardarCambioEstado);
    }

    // Manejo de Clicks en la Sidebar
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            
            const target = e.currentTarget;
            target.classList.add('active');
            
            const entidad = target.dataset.entidad;
            const nombreVisual = target.innerText.trim();

            if (entidad === 'dashboard') {
                mostrarVistaDashboard();
            } else {
                mostrarVistaTabla(entidad, nombreVisual);
            }
        });
    });

    // Filtro por Estado en Reclamos
    const filtroEstado = document.getElementById('filtro-estado-reclamo');
    if (filtroEstado) {
        filtroEstado.addEventListener('change', (e) => cargarDatosReclamos(e.target.value));
    }
    
    // Inicializar módulo independiente de Operadores
    inicializarModuloOperadores();
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

async function cargarMetricasIniciales() {
    try {
        const res = await fetch(`${API_BASE_URL}/reclamos/`, { headers: getAuthHeaders() });
        if (res.ok) {
            const data = await res.json();
            actualizarMetricas(data.results || data);
        }
    } catch (err) {
        console.error('Error al consultar métricas iniciales:', err);
    }
}

function mostrarVistaDashboard() {
    document.getElementById('seccion-metricas').classList.remove('d-none');
    document.getElementById('seccion-tabla-panel').classList.add('d-none');
    
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    const linkDashboard = document.querySelector('[data-entidad="dashboard"]');
    if (linkDashboard) linkDashboard.classList.add('active');

    cargarMetricasIniciales();
}

function mostrarVistaTabla(entidad, nombreVisual) {
    document.getElementById('seccion-metricas').classList.add('d-none');
    document.getElementById('seccion-tabla-panel').classList.remove('d-none');
    document.getElementById('titulo-vista-actual').innerText = `Gestión de ${nombreVisual}`;

    const tbody = document.getElementById('tabla-reclamos-body');
    const contenedorFiltro = document.getElementById('contenedor-filtro-interno');

    if (entidad === 'reclamos') {
        restablecerHeadersReclamos();
        contenedorFiltro.style.display = 'flex';
        cargarDatosReclamos();
    } else if (entidad === 'operadores') {
        cargarVistaOperadores(tbody, contenedorFiltro);
    } else {
        restablecerHeadersReclamos();
        contenedorFiltro.style.display = 'none';
        consultarEntidadGenerica(entidad, nombreVisual);
    }
}

function restablecerHeadersReclamos() {
    const tableHeaders = document.getElementById('tabla-headers');
    if (tableHeaders) {
        tableHeaders.innerHTML = `
            <tr>
                <th>#ID</th>
                <th>Título / Descripción</th>
                <th>Categoría</th>
                <th>Vecino</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
            </tr>
        `;
    }
}

async function cargarDatosReclamos(estadoFiltro = '') {
    const tbody = document.getElementById('tabla-reclamos-body');
    tbody.innerHTML = `<tr><td colspan="7">Cargando reclamos...</td></tr>`;

    let url = `${API_BASE_URL}/reclamos/`;
    if (estadoFiltro) url += `?estado_actual=${estadoFiltro}`;

    try {
        const res = await fetch(url, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Error al consultar reclamos');

        const data = await res.json();
        const reclamos = data.results || data;

        actualizarMetricas(reclamos);
        renderTablaReclamos(reclamos, tbody);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" style="color: red;">Error al conectar con la API (${API_BASE_URL}).</td></tr>`;
    }
}

function renderTablaReclamos(reclamos, tbody) {
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
            <td><strong>${r.estado_actual ? r.estado_actual.nombre : '-'}</strong></td>
            <td>
                <button class="btn-cambiar-estado" data-id="${r.id}" style="background: #2563eb; color: white; border: none; padding: 0.35rem 0.7rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">
                    Cambiar Estado
                </button>
            </td>
        </tr>
    `).join('');

    document.querySelectorAll('.btn-cambiar-estado').forEach(btn => {
        btn.addEventListener('click', (e) => cambiarEstadoModal(e.target.dataset.id));
    });
}

function cambiarEstadoModal(reclamoId) {
    document.getElementById('modal-reclamo-id').value = reclamoId;
    document.getElementById('modal-select-estado').value = '';
    document.getElementById('modal-observacion').value = '';

    const modalElement = document.getElementById('modalCambiarEstado');
    modalEstadoInstance = new bootstrap.Modal(modalElement);
    modalEstadoInstance.show();
}

async function guardarCambioEstado(e) {
    e.preventDefault();

    const reclamoId = document.getElementById('modal-reclamo-id').value;
    const nuevoEstado = document.getElementById('modal-select-estado').value;
    const observacion = document.getElementById('modal-observacion').value.trim();

    if (!nuevoEstado || !observacion) return;

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
            if (modalEstadoInstance) modalEstadoInstance.hide();
            cargarDatosReclamos();
        } else {
            const error = await res.json();
            alert(`Error: ${error.detail || 'No se pudo actualizar el estado'}`);
        }
    } catch (err) {
        alert('Error al conectar con la API.');
    }
}

async function consultarEntidadGenerica(endpoint, nombreVisual) {
    const tbody = document.getElementById('tabla-reclamos-body');
    tbody.innerHTML = `<tr><td colspan="7">Cargando catálogo de ${nombreVisual}...</td></tr>`;

    try {
        const res = await fetch(`${API_BASE_URL}/${endpoint}/`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`Error al consultar ${endpoint}`);

        const data = await res.json();
        const items = data.results || data;

        if (items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7">No existen registros para esta entidad.</td></tr>`;
            return;
        }

        tbody.innerHTML = items.map(item => `
            <tr>
                <td><strong>#${item.id}</strong></td>
                <td colspan="4"><strong>${item.nombre || item.username || item.action || 'Registro'}</strong></td>
                <td><span style="font-size: 0.75rem; color: #64748b;">${item.descripcion || item.email || item.detail || '-'}</span></td>
                <td>
                    <button style="background: #64748b; color: white; border: none; padding: 0.35rem 0.7rem; border-radius: 6px; color: white; font-size: 0.75rem;">
                        Editar / Ver
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" style="color: red;">Error al consultar endpoint /${endpoint}/.</td></tr>`;
    }
}

function actualizarMetricas(reclamos) {
    document.getElementById('metric-total').innerText = reclamos.length;
    document.getElementById('metric-pendientes').innerText = reclamos.filter(r => r.estado_actual && r.estado_actual.id === 1).length;
    document.getElementById('metric-proceso').innerText = reclamos.filter(r => r.estado_actual && r.estado_actual.id === 2).length;
    document.getElementById('metric-resueltos').innerText = reclamos.filter(r => r.estado_actual && r.estado_actual.id === 3).length;
}