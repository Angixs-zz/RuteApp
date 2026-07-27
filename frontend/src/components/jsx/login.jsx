import React, { useState } from 'react';
import api from '../../service/api';
import '../css/login.css';              // Sube un nivel para encontrar css

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados para los errores debajo de cada campo
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiamos errores previos
    setErrorEmail('');
    setErrorPassword('');
    setErrorGeneral('');

    let hayErrores = false;

    // Validación visual debajo del input de email
    if (!email) {
      setErrorEmail('El correo electrónico es obligatorio.');
      hayErrores = true;
    }

    // Validación visual debajo del input de contraseña
    if (!password) {
      setErrorPassword('La contraseña es obligatoria.');
      hayErrores = true;
    }

    if (hayErrores) return;

    try {
      // Conexión con el backend usando Axios
      const response = await api.post('/api/auth/login', {
        correo: email,     // <--- Aquí mandamos el valor del estado 'email' con la llave 'correo' que pide Java
        password           // <--- 'password' se queda igual porque coincide con el DTO
      });

      // Guardamos el token JWT en el localStorage
      localStorage.setItem('token', response.data.token);
      
      alert('¡Bienvenido a RuteApp!');

    } catch (error) {
      console.error(error);
      setErrorGeneral('Credenciales incorrectas o error al conectar con el servidor.');
    }};

  return (
    <div className="login-container">
      <h2>Iniciar Sesión - RuteApp</h2>
      
      {errorGeneral && <div className="login-error" style={{ marginBottom: '15px' }}>{errorGeneral}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="login-form-group">
          <label>Correo Electrónico:</label><br />
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
          {errorEmail && <small className="login-error">{errorEmail}</small>}
        </div>

        <div className="login-form-group">
          <label>Contraseña:</label><br />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          {errorPassword && <small className="login-error">{errorPassword}</small>}
        </div>

        <button type="submit" className="login-button">
          Entrar
        </button>
      </form>
    </div>
  );
}