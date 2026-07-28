import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/styles.css';
import logoImg from '../../assets/react.svg';

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorEmail('Por favor ingresa tu correo electrónico');
      return;
    }
    if (!email.includes('@')) {
      setErrorEmail('Ingresa un correo electrónico válido');
      return;
    }
    setErrorEmail('');
    setEnviado(true);
    triggerToast('Enlace de recuperación enviado al correo');
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
            <path 
              d="M30,370 C155,80 260,400 370,150 C435,15 525,170 585,65" 
              fill="none" 
              stroke="rgba(255,255,255,.9)" 
              strokeWidth="10" 
              strokeLinecap="round" 
              strokeDasharray="12 18"
            />
            <circle cx="32" cy="368" r="13" fill="#FF735C" stroke="#fff" strokeWidth="5"/>
            <circle cx="370" cy="150" r="13" fill="#F7B955" stroke="#fff" strokeWidth="5"/>
            <circle cx="585" cy="65" r="13" fill="#FF735C" stroke="#fff" strokeWidth="5"/>
          </svg>
        </div>
        <div className="auth-copy">
          <span className="eyebrow" style={{ color: '#F7B955' }}>RUTEAPP</span>
          <h1>Recupera el acceso de forma segura.</h1>
          <p>Te enviaremos un enlace para crear una nueva contraseña.</p>
        </div>
      </aside>

      {/* Lado derecho con el formulario */}
      <main className="auth-form-side">
        <section className="auth-card">
          <div className="mobile-logo brand">
            <img src={logoImg} alt="RuteApp" />
          </div>
          <span className="eyebrow">ACCESO A LA PLATAFORMA</span>
          <h1>Recuperar contraseña</h1>
          <p className="muted">Escribe el correo asociado a tu cuenta.</p>

          <form onSubmit={handleSubmit} noValidate>
            <label className={`field ${errorEmail ? 'error' : ''}`}>
              <span>Correo electrónico</span>
              <input 
                type="email" 
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorEmail) setErrorEmail('');
                }}
              />
              {errorEmail && <span className="error-text">{errorEmail}</span>}
            </label>

            <button type="submit" className="button primary full">
              Enviar enlace de recuperación
            </button>

            {enviado && (
              <div className="banner success" style={{ marginTop: '18px' }}>
                <div className="banner-icon">✉️</div>
                <div>
                  <strong>Correo preparado</strong>
                  <span>El enlace será válido durante 30 minutos.</span>
                </div>
              </div>
            )}

            <p className="small" style={{ textAlign: 'center', marginTop: '18px' }}>
              <Link to="/login">← Volver a iniciar sesión</Link>
            </p>
          </form>
        </section>
      </main>

      {/* Notification Toast */}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </div>
  );
}
