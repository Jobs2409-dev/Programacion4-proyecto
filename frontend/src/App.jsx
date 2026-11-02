// frontend/src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import NuevoReclamo from './components/NuevoReclamo';
import api from './api/axios';
import { socket } from './services/socket';

function RutaProtegida({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
}

function Dashboard() {
  const { usuario, cerrarSesion } = useAuth();
  const [reclamos, setReclamos] = useState([]);
  const [alertasSockets, setAlertasSockets] = useState([]);

  // Cargar lista de reclamos desde la API
  const cargarReclamos = async () => {
    try {
      const res = await api.get('/reclamos');
      setReclamos(res.data.reclamos || []);
    } catch (err) {
      console.error('Error al cargar reclamos:', err);
    }
  };

  useEffect(() => {
    cargarReclamos();

    // 1. Conectar Socket.io
    socket.connect();

    // 2. Si es personal interno, unirse a la sala de agentes (para alertas de Firestore)
    if (['OPERADOR', 'ADMIN'].includes(usuario.rol)) {
      socket.emit('join_room', 'agentes');
    }

    // 3. Escuchar notificaciones en tiempo real desde el backend Node
    socket.on('nuevo_reclamo', (data) => {
      console.log('⚡ Evento nuevo_reclamo:', data);
      setAlertasSockets(prev => [data.mensaje, ...prev]);
      // Agregar el nuevo reclamo arriba en la lista
      setReclamos(prev => [data.reclamo, ...prev]);
    });

    socket.on('nueva_alerta_urgente', (alerta) => {
      console.log('🚨 Evento de Firestore:', alerta);
      setAlertasSockets(prev => [`ALERTA FIRESTORE: ${alerta.mensaje || 'Alerta recibida'}`, ...prev]);
    });

    return () => {
      socket.off('nuevo_reclamo');
      socket.off('nueva_alerta_urgente');
      socket.disconnect();
    };
  }, [usuario]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>CoreDesk - Panel de Reclamos</h2>
        <div>
          <span>{usuario.email} (<b>{usuario.rol}</b>) </span>
          <button onClick={cerrarSesion}>Cerrar Sesión</button>
        </div>
      </div>
      <hr />

      {/* Notificaciones de Sockets en vivo */}
      {alertasSockets.length > 0 && (
        <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
          <h4>🔔 Notificaciones en vivo:</h4>
          <ul>
            {alertasSockets.map((msg, idx) => <li key={idx}>{msg}</li>)}
          </ul>
        </div>
      )}

      {/* Formulario solo visible o habilitado para el flujo de reclamos */}
      <NuevoReclamo onReclamoCreado={(nuevo) => console.log('Reclamo guardado:', nuevo)} />

      <h3>Lista de Reclamos ({reclamos.length})</h3>
      {reclamos.length === 0 ? (
        <p>No hay reclamos registrados.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {reclamos.map(rec => (
            <li key={rec._id} style={{ border: '1px solid #ddd', padding: '12px', marginBottom: '10px', borderRadius: '5px' }}>
              <h4>{rec.titulo} <span style={{ fontSize: '0.8em', color: '#666' }}>({rec.estado_actual})</span></h4>
              <p>{rec.descripcion}</p>
              {rec.ubicacion?.direccion && <small>📍 Ubicación: {rec.ubicacion.direccion}</small>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <RutaProtegida>
                <Dashboard />
              </RutaProtegida>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}