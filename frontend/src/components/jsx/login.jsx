import React from 'react';
import { Link } from 'react-router-dom'; // <--- 1. Importamos Link para la navegación fluida
import '../css/styles.css'; 
import logoImg from '../../assets/react.svg'; // <--- 2. Apuntamos a tu logo real .png
import { useLogin } from '../js/login';

export default function Login() {
  const {
    email, setEmail,
    password, setPassword,
    errorEmail,
    errorPassword,
    errorGeneral,
    mensajeExito,
    loading,
    handleSubmit
  } = useLogin();

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
              <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
            </div>

            <button type="submit" className="button primary full" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            <div className="separator">o continúa con</div>
            <button type="button" className="button ghost full" onClick={() => alert('Próximamente disponible')}>
              Continuar con Google
            </button>

            {/* 3. Reemplazamos <a> por <Link> de react-router-dom */}
            <p className="small" style={{ textAlign: 'center', marginTop: '18px' }}>
              ¿No tienes una cuenta? <Link to="/registro">Crear cuenta</Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}