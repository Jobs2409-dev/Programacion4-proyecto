// front-web/static/js/vecino/vecino-nuevo-reclamo.js
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('access_token');
    
    // 1. Control de acceso: Si no está logueado, alerta y redirige al login
    if (!token) {
        alert("Debés iniciar sesión para poder registrar un reclamo.");
        window.location.href = '/login/';
        return;
    }

    await cargarCategorias();

    const form = document.getElementById('form-nuevo-reclamo');
    if (form) {
        form.addEventListener('submit', handleCrearReclamo);
    }
});

// Carga el selector con las categorías de la API (:8000)
async function cargarCategorias() {
    const selectCat = document.getElementById('categoria');
    try {
        const response = await fetch('http://127.0.0.1:8000/api/categorias/');
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extrae el arreglo independientemente de si la API usa paginación (data.results) o no (data)
        const categorias = Array.isArray(data) ? data : (data.results || []);
        
        if (categorias.length === 0) {
            selectCat.innerHTML = '<option value="">No hay categorías disponibles</option>';
            return;
        }

        selectCat.innerHTML = '<option value="">-- Seleccioná una categoría --</option>';
        categorias.forEach(cat => {
            selectCat.innerHTML += `<option value="${cat.id}">${cat.nombre}</option>`;
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        selectCat.innerHTML = '<option value="">Error al cargar categorías</option>';
    }
}

// Envío del reclamo con JWT Bearer Token
async function handleCrearReclamo(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('access_token');
    const alertaError = document.getElementById('alerta-error');
    const btnGuardar = document.getElementById('btn-guardar');

    const titulo = document.getElementById('titulo').value.trim();
    const categoriaId = document.getElementById('categoria').value;
    const descripcion = document.getElementById('descripcion').value.trim();

    alertaError.style.display = 'none';
    btnGuardar.disabled = true;
    btnGuardar.innerText = 'Enviando...';

    // Verificamos que se haya seleccionado una categoría válida
    if (!categoriaId) {
        alertaError.innerText = 'Por favor seleccioná una categoría válida.';
        alertaError.style.display = 'block';
        btnGuardar.disabled = false;
        btnGuardar.innerText = 'Publicar Reclamo';
        return;
    }

    const payload = {
        titulo: titulo,
        categoria: parseInt(categoriaId),
        descripcion: descripcion
    };

    try {
        const response = await fetch('http://127.0.0.1:8000/api/reclamos/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            // Imprime en consola la respuesta detallada de validación de DRF
            console.error('Detalle del error 400 devuelto por la API:', data);
            
            // Extrae el mensaje de error de DRF en texto legible
            const mensajeError = typeof data === 'object' 
                ? JSON.stringify(data) 
                : (data.detail || 'Error al validar los datos del reclamo.');
                
            throw new Error(mensajeError);
        }

        alert('¡Reclamo creado con éxito!');
        window.location.href = '/mis-reclamos/';

    } catch (error) {
        console.error('Error al crear reclamo:', error);
        alertaError.innerText = 'No se pudo guardar: ' + error.message;
        alertaError.style.display = 'block';
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerText = 'Publicar Reclamo';
    }
}