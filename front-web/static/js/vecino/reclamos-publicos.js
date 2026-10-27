// front-web/static/js/vecino/reclamos-publicos.js
import { API_BASE_URL } from '../config/config.js';

document.addEventListener('DOMContentLoaded', () => {
    cargarEstadisticasGlobales();
    cargarCategoriasPublicas();
    cargarReclamosPublicos();

    const filtro = document.getElementById('filtro-categoria-publico');
    if (filtro) {
        filtro.addEventListener('change', (e) => cargarReclamosPublicos(e.target.value));
    }

    window.addEventListener('reclamo:actualizado', () => {
        cargarEstadisticasGlobales();
        cargarReclamosPublicos(filtro ? filtro.value : '');
    });
});

// 1. Consume GET /api/reclamos/estadisticas/ (AllowAny)
async function cargarEstadisticasGlobales() {
    const elTotal = document.getElementById('pub-metric-total');
    const elResueltos = document.getElementById('pub-metric-resueltos');
    const elProceso = document.getElementById('pub-metric-proceso');

    try {
        const res = await fetch(`${API_BASE_URL}/reclamos/estadisticas/`);
        if (!res.ok) return;

        const data = await res.json();
        if (elTotal) elTotal.innerText = data.total_reclamos || 0;

        // Búsqueda de cantidades por estado en el arreglo 'por_estado'
        if (data.por_estado && Array.isArray(data.por_estado)) {
            const resueltosObj = data.por_estado.find(e => e.estado_actual__nombre === 'Resuelto');
            const procesoObj = data.por_estado.find(e => e.estado_actual__nombre === 'En Proceso');

            if (elResueltos) elResueltos.innerText = resueltosObj ? resueltosObj.cantidad : 0;
            if (elProceso) elProceso.innerText = procesoObj ? procesoObj.cantidad : 0;
        }
    } catch (err) {
        console.error('Error al cargar métricas públicas:', err);
    }
}

// 2. Consume GET /api/categorias/ (AllowAny por SAFE_METHODS)
async function cargarCategoriasPublicas() {
    const select = document.getElementById('filtro-categoria-publico');
    if (!select) return;

    try {
        const res = await fetch(`${API_BASE_URL}/categorias/`);
        if (!res.ok) return;
        const data = await res.json();
        const categorias = data.results || data;

        select.innerHTML = '<option value="">Todas las categorías</option>' +
            categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    } catch (err) {
        console.error('Error al cargar categorías:', err);
    }
}

// 3. Consume GET /api/reclamos/publicos/ (AllowAny con datos anonimizados)
async function cargarReclamosPublicos(categoriaId = '') {
    const contenedor = document.getElementById('contenedor-reclamos-publicos');
    if (!contenedor) return;

    let url = `${API_BASE_URL}/reclamos/publicos/`;
    if (categoriaId) url += `?categoria=${categoriaId}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error al cargar incidencias públicas');

        const reclamos = await res.json();
        renderTarjetasPublicas(reclamos, contenedor);
    } catch (err) {
        contenedor.innerHTML = `<p class="metrica-publica-label" style="color: #ef4444;">No se pudieron consultar los reclamos públicos.</p>`;
    }
}

function renderTarjetasPublicas(reclamos, contenedor) {
    if (reclamos.length === 0) {
        contenedor.innerHTML = `<p class="metrica-publica-label">No hay reclamos públicos abiertos registrados en esta categoría.</p>`;
        return;
    }

    contenedor.innerHTML = reclamos.map(r => `
        <article class="tarjeta-reclamo-pub">
            <div class="tarjeta-pub-top">
                <span class="badge-categoria">
                    ${r.categoria ? r.categoria.nombre : 'General'}
                </span>
                <span style="font-size: 0.75rem; color: #64748b;">
                    ${new Date(r.fecha_creacion).toLocaleDateString('es-AR')}
                </span>
            </div>
            <h3 class="tarjeta-pub-titulo">${r.titulo}</h3>
            <p class="tarjeta-pub-desc">${r.descripcion}</p>
            <div class="tarjeta-pub-footer">
                <span style="font-size: 0.8rem; font-weight: bold; color: #1e40af;">
                    Estado: ${r.estado_actual ? r.estado_actual.nombre : 'Pendiente'}
                </span>
                <span style="font-size: 0.75rem; color: #64748b;">
                    👤 ${r.usuario ? r.usuario.username : 'Vecino'}
                </span>
            </div>
        </article>
    `).join('');
}