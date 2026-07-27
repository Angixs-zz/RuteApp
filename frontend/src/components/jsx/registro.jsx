import React, { useState } from 'react';
import api from '../../service/api';
import '../css/login.css'; 

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  
  const [errorNombre, setErrorNombre] = useState('');
  const [errorCorreo, setErrorCorreo] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    
    setErrorNombre('');
    setErrorCorreo('');
    setErrorPassword('');
    setErrorGeneral('');
    setMensajeExito('');

    let hayErrores = false;

    if (!nombre.trim()) {
      setErrorNombre('El nombre es obligatorio.');
      hayErrores = true;
    }

    if (!correo.trim()) {
      setErrorCorreo('El correo es obligatorio.');
      hayErrores = true;
    }

    // Validamos que cumpla con lo mínimo antes de mandarlo para evitar el error 400
    if (!password) {
      setErrorPassword('La contraseña es obligatoria.');
      hayErrores = true;
    } else if (password.length < 8) {
      setErrorPassword('Debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.');
      hayErrores = true;
    }

    if (hayErrores) return;

    try {
      // Conexión con el backend usando la ruta de usuarios que acepta tu seguridad
      await api.post('/api/usuarios', {
        nombre,
        correo,
        password,
        avatar: null, // Opcional según tu DTO
        rolId: 1      // Cambia el ID del rol según tu base de datos si lo requiere
      });

      setMensajeExito('¡Registro exitoso! Ya puedes iniciar sesión.');
      setNombre('');
      setCorreo('');
      setPassword('');

    } catch (error) {
      console.error(error);
      setErrorGeneral('Error al registrarse. Revisa que la contraseña tenga mayúscula, número y símbolo, o que el correo no esté registrado.');
    }
  };

  return (
    <div className="login-container">
      <h2>Registro - RuteApp</h2>
      
      {errorGeneral && <div className="login-error" style={{ marginBottom: '15px' }}>{errorGeneral}</div>}
      {mensajeExito && <div style={{ color: 'green', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>{mensajeExito}</div>}

      <form onSubmit={handleRegister} noValidate>
        <div className="login-form-group">
          <label>Nombre:</label><br />
          <input 
            type="text" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)}
            className="login-input"
          />
          {errorNombre && <small className="login-error">{errorNombre}</small>}
        </div>

        <div className="login-form-group">
          <label>Correo Electrónico:</label><br />
          <input 
            type="email" 
            value={correo} 
            onChange={(e) => setCorreo(e.target.value)}
            className="login-input"
          />
          {errorCorreo && <small className="login-error">{errorCorreo}</small>}
        </div>

        <div className="login-form-group">
          <label>Contraseña:</label><br />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <small style={{ color: '#666', fontSize: '11px' }}>Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.</small><br />
          {errorPassword && <small className="login-error">{errorPassword}</small>}
        </div>

        <button type="submit" className="login-button">
          Registrarse
        </button>
      </form>
    </div>
  );
}