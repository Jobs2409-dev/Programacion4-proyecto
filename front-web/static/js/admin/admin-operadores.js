// front-web/static/js/admin/admin-operadores.js
import { API_BASE_URL, getAuthHeaders } from '../config/config.js';

let modalOperadorInstance = null;
let listaOperadoresGlobal = [];

export function inicializarModuloOperadores() {
    const form = document.getElementById('form-operador');
    if (form) {
        form.removeEventListener('submit', guardarOperador);
        form.addEventListener('submit', guardarOperador);
    }
}

export async function cargarVistaOperadores(tbody, contenedorFiltro) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Cargando lista de operadores...</td></tr>`;

    const filtroAnterior = document.getElementById('filtro-rol-operador')?.value || '';
    if (contenedorFiltro) {
        contenedorFiltro.style.display = 'flex';
        contenedorFiltro.innerHTML = `
            <label for="filtro-rol-operador" class="small fw-bold text-muted mb-0">Rol:</label>
            <select id="filtro-rol-operador" class="form-select form-select-sm w-auto">
                <option value="">Todos los Roles</option>
                <option value="SIN_ROL">Sin rol</option>
                <option value="ADMIN">🛡️ ADMIN</option>
                <option value="OPERADOR">👤 OPERADOR</option>
                <option value="VECINO">🏡 VECINO</option>
            </select>
        `;
        const filtroRol = document.getElementById('filtro-rol-operador');
        filtroRol.value = filtroAnterior;
        filtroRol.addEventListener('change', (event) => {
            filtrarPorRol(event.target.value, tbody);
        });
    }

    try {
        listaOperadoresGlobal = await obtenerTodosLosUsuarios();
        renderTablaOperadores(listaOperadoresGlobal, tbody);
    } catch (err) {
        console.error('Error al cargar usuarios:', err);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">${escaparHtml(err.message)}</td></tr>`;
    }
}

async function obtenerTodosLosUsuarios() {
    const usuarios = [];
    let url = `${API_BASE_URL}/usuarios/`;

    while (url) {
        const response = await fetch(url, { headers: getAuthHeaders() });
        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(error ? JSON.stringify(error) : `Error al cargar usuarios (${response.status}).`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
            usuarios.push(...data);
            break;
        }
        if (!Array.isArray(data.results)) {
            throw new Error('La API devolvió una respuesta de usuarios con formato inválido.');
        }

        usuarios.push(...data.results);
        url = data.next;
    }

    return usuarios;
}

function renderTablaOperadores(operadores, tbody) {
    const tableHeaders = document.getElementById('tabla-headers');
    if (tableHeaders) {
        tableHeaders.innerHTML = `
            <tr>
                <th>#ID</th>
                <th>Nombre y Apellido</th>
                <th>Usuario / Email</th>
                <th>Rol</th>
                <th class="text-end">
                    <button id="btn-nuevo-operador" class="btn btn-success btn-sm fw-bold">
                        <i class="bi bi-person-plus me-1"></i> + Nuevo Operador
                    </button>
                </th>
            </tr>
        `;
        const btnNuevo = document.getElementById('btn-nuevo-operador');
        if (btnNuevo) btnNuevo.addEventListener('click', abrirModalNuevoOperador);
    }

    if (!operadores || operadores.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No hay operadores para mostrar.</td></tr>`;
        return;
    }

    tbody.innerHTML = operadores.map(op => {
        const nombreRol = op.rol ? (typeof op.rol === 'object' ? op.rol.nombre : op.rol) : 'SIN_ROL';
        const colorBadge = nombreRol === 'ADMIN' ? 'bg-danger' : (nombreRol === 'OPERADOR' ? 'bg-primary' : 'bg-secondary');
        const rolVisible = nombreRol === 'SIN_ROL' ? 'SIN ROL' : nombreRol;

        return `
            <tr>
                <td><strong>#${escaparHtml(op.id || 'N/A')}</strong></td>
                <td>
                    <strong>${escaparHtml(op.first_name || 'Sin Nombre')} ${escaparHtml(op.last_name || '')}</strong>
                </td>
                <td>
                    <span class="d-block">👤 ${escaparHtml(op.username)}</span>
                    <small class="text-muted">${escaparHtml(op.email || '-')}</small>
                </td>
                <td>
                    <span class="badge ${colorBadge}">
                        ${rolVisible}
                    </span>
                </td>
                <td class="text-end">
                    <button class="btn btn-outline-primary btn-sm me-1 btn-editar-op" data-id="${escaparHtml(op.id)}">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-outline-danger btn-sm btn-eliminar-op" data-id="${escaparHtml(op.id)}">
                        🗑️ Eliminar
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    document.querySelectorAll('.btn-editar-op').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const usuario = listaOperadoresGlobal.find(op => String(op.id) === e.currentTarget.dataset.id);
            if (usuario) abrirModalEditarOperador(usuario);
        });
    });

    document.querySelectorAll('.btn-eliminar-op').forEach(btn => {
        btn.addEventListener('click', (e) => eliminarOperador(e.currentTarget.dataset.id));
    });
}

function filtrarPorRol(rolSeleccionado, tbody) {
    if (!rolSeleccionado) {
        renderTablaOperadores(listaOperadoresGlobal, tbody);
        return;
    }

    const filtrados = listaOperadoresGlobal.filter(op => {
        const nombreRol = op.rol ? (typeof op.rol === 'object' ? op.rol.nombre : op.rol) : 'SIN_ROL';
        return nombreRol.toUpperCase() === rolSeleccionado.toUpperCase();
    });

    renderTablaOperadores(filtrados, tbody);
}

function escaparHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function abrirModalNuevoOperador() {
    document.getElementById('operador-id').value = '';
    document.getElementById('modal-operador-titulo').innerText = 'Nuevo Operador';
    document.getElementById('operador-nombre').value = '';
    document.getElementById('operador-apellido').value = '';
    document.getElementById('operador-username').value = '';
    document.getElementById('operador-email').value = '';
    document.getElementById('operador-password').value = '';
    document.getElementById('operador-password').required = true;
    document.getElementById('password-help').classList.add('d-none');
    document.getElementById('operador-rol').value = 'OPERADOR';

    const modalElem = document.getElementById('modalOperador');
    modalOperadorInstance = new bootstrap.Modal(modalElem);
    modalOperadorInstance.show();
}

function abrirModalEditarOperador(op) {
    document.getElementById('operador-id').value = op.id || op.username;
    document.getElementById('modal-operador-titulo').innerText = `Editar Operador: ${op.username}`;
    document.getElementById('operador-nombre').value = op.first_name || '';
    document.getElementById('operador-apellido').value = op.last_name || '';
    document.getElementById('operador-username').value = op.username || '';
    document.getElementById('operador-email').value = op.email || '';
    document.getElementById('operador-password').value = '';
    document.getElementById('operador-password').required = false;
    document.getElementById('password-help').classList.remove('d-none');
    
    const nombreRol = op.rol ? (typeof op.rol === 'object' ? op.rol.nombre : op.rol) : 'OPERADOR';
    document.getElementById('operador-rol').value = nombreRol;

    const modalElem = document.getElementById('modalOperador');
    modalOperadorInstance = new bootstrap.Modal(modalElem);
    modalOperadorInstance.show();
}

async function guardarOperador(e) {
    e.preventDefault();

    const username = document.getElementById('operador-username').value.trim();
    const email = document.getElementById('operador-email').value.trim();
    const password = document.getElementById('operador-password').value;
    const first_name = document.getElementById('operador-nombre').value.trim();
    const last_name = document.getElementById('operador-apellido').value.trim();
    const rolSeleccionado = document.getElementById('operador-rol').value;
    const usuarioId = document.getElementById('operador-id').value;
    const payload = { username, email, first_name, last_name, rol_nombre: rolSeleccionado };
    if (password) payload.password = password;

    try {
        const res = await fetch(
            usuarioId ? `${API_BASE_URL}/usuarios/${usuarioId}/` : `${API_BASE_URL}/usuarios/`,
            {
                method: usuarioId ? 'PATCH' : 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            }
        );

        if (res.ok) {
            alert(usuarioId ? 'Usuario actualizado exitosamente.' : 'Usuario registrado exitosamente.');
            if (modalOperadorInstance) modalOperadorInstance.hide();

            const tbody = document.getElementById('tabla-reclamos-body');
            await cargarVistaOperadores(tbody, document.getElementById('contenedor-filtro-interno'));
        } else {
            const errData = await res.json().catch(() => null);
            alert(`Error al guardar usuario: ${errData ? JSON.stringify(errData) : res.statusText}`);
        }
    } catch (err) {
        console.error('Error al guardar usuario:', err);
        alert('Error al conectar con el servidor.');
    }
}

async function eliminarOperador(id) {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json().catch(() => null);
            alert(`Error al eliminar usuario: ${error ? JSON.stringify(error) : response.statusText}`);
            return;
        }

        const tbody = document.getElementById('tabla-reclamos-body');
        await cargarVistaOperadores(tbody, document.getElementById('contenedor-filtro-interno'));
    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        alert('Error al conectar con el servidor.');
    }
}