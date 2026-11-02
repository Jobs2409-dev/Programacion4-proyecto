// frontend/src/components/NuevoReclamo.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function NuevoReclamo({ onReclamoCreado }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [direccion, setDireccion] = useState('');
  const [categorias, setCategorias] = useState([]);
  
  // Estado para el análisis de IA
  const [analizandoIA, setAnalizandoIA] = useState(false);
  const [sugerenciaIA, setSugerenciaIA] = useState(null);
  const [mensaje, setMensaje] = useState('');

  // Cargar categorías relacionales desde MySQL
  useEffect(() => {
    api.get('/categorias')
      .then(res => setCategorias(res.data))
      .catch(err => console.error('Error al cargar categorías:', err));
  }, []);

  // Consultar endpoint de IA (Gemini)
  const analizarConIA = async () => {
    if (!descripcion.trim()) {
      alert('Escribí una descripción primero para analizarla.');
      return;
    }
    setAnalizandoIA(true);
    setSugerenciaIA(null);
    try {
      const res = await api.post('/ai/analizar', { descripcion });
      setSugerenciaIA(res.data.analisis);
    } catch (err) {
      console.error('Error al analizar con IA:', err);
    } finally {
      setAnalizandoIA(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      const payload = {
        titulo,
        descripcion,
        categoria_id: Number(categoriaId),
        ubicacion: direccion ? { direccion } : {}
      };

      const res = await api.post('/reclamos', payload);
      setMensaje('¡Reclamo creado exitosamente!');
      
      // Limpiar formulario
      setTitulo('');
      setDescripcion('');
      setCategoriaId('');
      setDireccion('');
      setSugerenciaIA(null);

      if (onReclamoCreado) onReclamoCreado(res.data.reclamo);
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || 'Error al crear el reclamo');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>Registrar Nuevo Reclamo</h3>
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Título:</label><br />
          <input 
            type="text" 
            value={titulo} 
            onChange={e => setTitulo(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>

        <div>
          <label>Categoría (MySQL):</label><br />
          <select 
            value={categoriaId} 
            onChange={e => setCategoriaId(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          >
            <option value="">-- Seleccionar categoría --</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre} ({cat.area_nombre || `Área ${cat.area_id}`})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Dirección / Ubicación:</label><br />
          <input 
            type="text" 
            value={direccion} 
            onChange={e => setDireccion(e.target.value)} 
            placeholder="Ej: Av. Neustadt 1230" 
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>

        <div>
          <label>Descripción detallada:</label><br />
          <textarea 
            value={descripcion} 
            onChange={e => setDescripcion(e.target.value)} 
            required 
            rows={4} 
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>

        <button 
          type="button" 
          onClick={analizarConIA} 
          disabled={analizandoIA}
          style={{ marginRight: '10px', background: '#6f42c1', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px' }}
        >
          {analizandoIA ? 'Analizando con Gemini...' : '✨ Sugerir Prioridad (IA)'}
        </button>

        <button type="submit" style={{ padding: '8px 12px' }}>
          Enviar Reclamo
        </button>
      </form>

      {sugerenciaIA && (
        <div style={{ marginTop: '15px', padding: '10px', background: '#e9ecef', borderRadius: '4px' }}>
          <strong>Respuesta de IA:</strong>
          <p>Prioridad sugerida: <b style={{ color: 'red' }}>{sugerenciaIA.prioridad}</b></p>
          <p>Resumen corto: {sugerenciaIA.resumen}</p>
        </div>
      )}
    </div>
  );
}