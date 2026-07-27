import React from 'react';
import { Link } from 'react-router-dom'; // <--- 1. Importamos Link para navegación fluida
import '../css/styles.css'; 
import logoImg from '../../assets/react.svg'; // <--- 2. Apuntando a tu logo real en png
import { registro as useRegistro } from '../js/registro';

export default function Registro() {
  const {
    nombre, setNombre,
    correo, setCorreo,
    password, setPassword,
    avatar, setAvatar,
    rolId, setRolId,
    errorNombre,
    errorCorreo,
    errorPassword,
    errorGeneral,
    mensajeExito,
    loading,
    handleRegister
  } = useRegistro();

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
          <h1>Planeen juntos desde el primer momento.</h1>
          <p>Invita a tu grupo, confirma participantes y mantengan todos los acuerdos visibles.</p>
        </div>
      </aside>

      {/* Lado derecho del formulario */}
      <main className="auth-form-side">
        <section className="auth-card">
          <div className="mobile-logo brand">
            <img src={logoImg} alt="RuteApp" />
          </div>
          
          <span className="eyebrow">ACCESO A LA PLATAFORMA</span>
          <h1>Crea tu cuenta</h1>
          <p className="muted">Empieza a organizar tus próximas experiencias.</p>

          {errorGeneral && <div className="banner warn" style={{ marginBottom: '15px' }}><div><strong>Aviso</strong><span>{errorGeneral}</span></div></div>}
          {mensajeExito && <div className="banner success" style={{ marginBottom: '15px' }}><div><strong>¡Éxito!</strong><span>{mensajeExito}</span></div></div>}

          <form onSubmit={handleRegister} noValidate>
            <label className={`field ${errorNombre ? 'error' : ''}`}>
              <span>Nombre completo</span>
              <input 
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre Completo"
              />
              {errorNombre && <span className="error-text">{errorNombre}</span>}
            </label>

            <label className={`field ${errorCorreo ? 'error' : ''}`}>
              <span>Correo electrónico</span>
              <input 
                type="email" 
                value={correo} 
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="correo@ruteapp.mx"
              />
              {errorCorreo && <span className="error-text">{errorCorreo}</span>}
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

            <div className="password-rules">
              <span>Mínimo 8 caracteres</span>
              <span>Una mayúscula</span>
              <span>Un número</span>
              <span>Un carácter especial</span>
            </div>

            <label className="field">
              <span>URL del Avatar (Opcional)</span>
              <input 
                type="text" 
                value={avatar} 
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
              />
            </label>

            <label className="field">
              <span>Tipo de Usuario / Rol</span>
              <select 
                value={rolId} 
                onChange={(e) => setRolId(e.target.value)}
              >
                <option value="1">ORGANIZADOR</option>
                <option value="3">ADMINISTRADOR</option>
                <option value="4">AGENCIA</option>
              </select>
            </label>

            <button type="submit" className="button primary full" style={{ marginTop: '18px' }} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            {/* 3. Reemplazamos <a> por <Link> para cambiar a /login sin recargar */}
            <p className="small" style={{ textAlign: 'center', marginTop: '18px' }}>
              ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}