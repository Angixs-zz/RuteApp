import React, { useState } from 'react';
import Login from './components/jsx/login';
import Registro from './components/jsx/registro';

function App() {
  // Un estado rápido para alternar entre pantallas con un botón
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Botón temporal para cambiar de pantalla */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={() => setMostrarRegistro(!mostrarRegistro)}
          style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc' }}
        >
          {mostrarRegistro ? 'Ir a Iniciar Sesión' : 'Ir a Registrarse'}
        </button>
      </div>

      {/* Muestra Login o Registro dependiendo del estado */}
      {mostrarRegistro ? <Registro /> : <Login />}
    </div>
  );
}

export default App;