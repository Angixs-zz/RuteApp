import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/styles.css'; 
import logoImg from '../../assets/logo.jpeg'; 
import api from '../../service/api';
import { AuthContext } from '../../context/AuthContext';

export default function Login() {
  const { loginContext } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setErrorEmail('');
    setErrorPassword('');
    setErrorGeneral('');
    setMensajeExito('');

    let hayErrores = false;

    if (!email.trim()) {
      setErrorEmail('El correo electrónico es obligatorio.');
      hayErrores = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorEmail('El formato del correo no es válido.');
      hayErrores = true;
    }

    if (!password) {
      setErrorPassword('La contraseña es obligatoria.');
      hayErrores = true;
    } else {
      if (password.length < 8) {
        setErrorPassword('Mínimo 8 caracteres.');
        hayErrores = true;
      } else if (!/(?=.*[A-Z])/.test(password)) {
        setErrorPassword('Debe incluir una mayúscula.');
        hayErrores = true;
      } else if (!/(?=.*\d)/.test(password)) {
        setErrorPassword('Debe incluir un número.');
        hayErrores = true;
      } else if (!/(?=.*[^A-Za-z0-9])/.test(password)) {
        setErrorPassword('Debe incluir un carácter especial.');
        hayErrores = true;
      }
    }

    if (hayErrores) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        correo: email,
        password
      });

      loginContext(response.data.token);
      setMensajeExito('¡Bienvenido a RuteApp!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error(error);
      if (!error.response) {
        setErrorGeneral('Error de conexión: El servidor no está respondiendo.');
      } else {
        setErrorGeneral('Credenciales incorrectas. Verifica tu correo y contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Lado izquierdo visual */}
      <aside className="auth-visual">
        <div className="brand" style={{ width: '150px' }}>
          <img src={logoImg} alt="RuteApp" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <div className="route-line">
          <svg viewBox="0 0 620 450">
            <path d="M30,370 C155,80 260,400 370,150 C435,15 525,170 585,65" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="10" strokeLinecap="round" strokeDasharray="12 18"/>
            <circle cx="32" cy="368" r="13" fill="#FF735C" stroke="#fff" strokeWidth="5"/>
            <circle cx="370" cy="150" r="13" fill="#F7B955" stroke="#fff" strokeWidth="5"/>
            <circle cx="585" cy="65" r="13" fill="#FF735C" stroke="#fff" strokeWidth="5"/>
          </svg>
        </div>
        <div className="auth-copy">
          <span className="eyebrow" style={{ color: 'var(--gold)' }}>RUTEAPP</span>
          <h1>Tu próximo viaje comienza con un buen plan.</h1>
          <p>Coordina participantes, actividades y gastos desde un solo lugar.</p>
        </div>
      </aside>

      {/* Lado derecho con el formulario */}
      <main className="auth-form-side">
        <section className="auth-card">
          <div className="mobile-logo brand">
            <img src={logoImg} alt="RuteApp" />
          </div>

          <span className="eyebrow">ACCESO A LA PLATAFORMA</span>
          <h1>Bienvenido de nuevo</h1>
          <p className="muted">Ingresa tus datos para continuar con tus viajes.</p>

          {errorGeneral && <div className="banner warn" style={{ marginBottom: '15px' }}><div><strong>Aviso</strong><span>{errorGeneral}</span></div></div>}
          {mensajeExito && <div className="banner success" style={{ marginBottom: '15px' }}><div><strong>¡Éxito!</strong><span>{mensajeExito}</span></div></div>}

          <form onSubmit={handleSubmit} noValidate>
            <label className={`field ${errorEmail ? 'error' : ''}`}>
              <span>Correo electrónico</span>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@ejemplo.com"
              />
              {errorEmail && <span className="error-text">{errorEmail}</span>}
            </label>

            <label className={`field ${errorPassword ? 'error' : ''}`}>
              <span>Contraseña</span>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
              {errorPassword && <span className="error-text">{errorPassword}</span>}
            </label>

            <div className="form-row">
              <label className="check">
                <input type="checkbox" /> Recordar sesión
              </label>
              <a href="#recuperar" onClick={(e) => e.preventDefault()}>¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="button primary full" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            <div className="separator">o continúa con</div>
            <button type="button" className="button ghost full" onClick={() => alert('Próximamente disponible')}>
              Continuar con Google
            </button>

            <p className="small" style={{ textAlign: 'center', marginTop: '18px' }}>
              ¿No tienes una cuenta? <Link to="/registro">Crear cuenta</Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}