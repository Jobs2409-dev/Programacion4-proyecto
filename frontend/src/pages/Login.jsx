// frontend/src/pages/Login.jsx
import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      if (esRegistro) {
        // Registro público (asigna ROL 'VECINO' en el backend)
        await api.post('/auth/register', { email, password });
        setMensaje('¡Registro exitoso! Ahora podés iniciar sesión.');
        setEsRegistro(false);
      } else {
        // Login general
        const res = await api.post('/auth/login', { email, password });
        iniciarSesion(res.data);
        navigate('/'); // Redirige al inicio/dashboard
      }
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || 'Ocurrió un error');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>{esRegistro ? 'Registro de Vecino' : 'Iniciar Sesión'}</h2>

      {mensaje && <p style={{ color: esRegistro ? 'green' : 'red' }}>{mensaje}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', margin: '8px 0' }}
          />
        </div>

        <div>
          <label>Contraseña:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', margin: '8px 0' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 15px', marginTop: '10px' }}>
          {esRegistro ? 'Registrarse' : 'Ingresar'}
        </button>
      </form>

      <br />
      <button 
        onClick={() => { setEsRegistro(!esRegistro); setMensaje(''); }}
        style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer' }}
      >
        {esRegistro ? '¿Ya tenés cuenta? Iniciá sesión' : '¿No tenés cuenta? Registrate como vecino'}
      </button>
    </div>
  );
}