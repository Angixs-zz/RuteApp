import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../service/api';
import logoImg from '../../assets/logo.png';
import '../css/styles.css';

function validarPassword(password) {
  if (!password) return 'La contraseña es obligatoria.';
  if (password.length < 8) return 'Debe tener al menos 8 caracteres.';
  if (!/[A-Z]/.test(password)) return 'Debe incluir una mayúscula.';
  if (!/\d/.test(password)) return 'Debe incluir un número.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Debe incluir un carácter especial.';
  return '';
}

export default function RestablecerContrasena() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorConfirmacion, setErrorConfirmacion] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');
  const [exito, setExito] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorGeneral('');

    const passwordInvalida = validarPassword(password);
    const confirmacionInvalida = password !== confirmacion
      ? 'Las contraseñas no coinciden.'
      : '';
    setErrorPassword(passwordInvalida);
    setErrorConfirmacion(confirmacionInvalida);

    if (passwordInvalida || confirmacionInvalida) return;

    setLoading(true);
    try {
      await api.post('/auth/recuperacion/restablecer', { token, password });
      setExito(true);
      setPassword('');
      setConfirmacion('');
    } catch (error) {
      const validacion = error.response?.data?.erroresValidacion?.password;
      if (validacion) {
        setErrorPassword(validacion);
      } else if (!error.response) {
        setErrorGeneral('No fue posible conectar con el servidor. Intenta nuevamente.');
      } else {
        setErrorGeneral(error.response.data?.mensaje || 'No fue posible cambiar la contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-visual">
        <div className="brand" style={{ marginBottom: '2rem' }}>
          <img src={logoImg} alt="RuteApp" style={{ width: '160px' }} />
        </div>
        <div className="auth-copy">
          <span className="eyebrow" style={{ color: 'var(--gold)' }}>RUTEAPP</span>
          <h1>Crea una nueva contraseña segura.</h1>
          <p>El enlace solo puede utilizarse una vez y vence después de 30 minutos.</p>
        </div>
      </aside>

      <main className="auth-form-side">
        <section className="auth-card">
          <div className="mobile-logo brand">
            <img src={logoImg} alt="RuteApp" />
          </div>
          <span className="eyebrow">SEGURIDAD DE LA CUENTA</span>
          <h1>Restablecer contraseña</h1>
          <p className="muted">Escribe y confirma tu nueva contraseña.</p>

          {!token && (
            <div className="banner warn" style={{ marginBottom: '15px' }}>
              <div><strong>Aviso</strong><span>El enlace de recuperación no contiene un token válido.</span></div>
            </div>
          )}
          {errorGeneral && (
            <div className="banner warn" style={{ marginBottom: '15px' }}>
              <div><strong>Aviso</strong><span>{errorGeneral}</span></div>
            </div>
          )}
          {exito && (
            <div className="banner success" style={{ marginBottom: '15px' }}>
              <div>
                <strong>Contraseña actualizada</strong>
                <span>Ya puedes iniciar sesión con tu nueva contraseña.</span>
              </div>
            </div>
          )}

          {token && !exito && (
            <form onSubmit={handleSubmit} noValidate>
              <label className={`field ${errorPassword ? 'error' : ''}`}>
                <span>Nueva contraseña</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (errorPassword) setErrorPassword('');
                  }}
                  placeholder="********"
                />
                {errorPassword && <span className="error-text">{errorPassword}</span>}
              </label>

              <label className={`field ${errorConfirmacion ? 'error' : ''}`}>
                <span>Confirmar contraseña</span>
                <input
                  type="password"
                  value={confirmacion}
                  onChange={(event) => {
                    setConfirmacion(event.target.value);
                    if (errorConfirmacion) setErrorConfirmacion('');
                  }}
                  placeholder="********"
                />
                {errorConfirmacion && <span className="error-text">{errorConfirmacion}</span>}
              </label>

              <div className="password-rules">
                <span>Mínimo 8 caracteres</span>
                <span>Una mayúscula</span>
                <span>Un número</span>
                <span>Un carácter especial</span>
              </div>

              <button type="submit" className="button primary full" disabled={loading}>
                {loading ? 'Actualizando...' : 'Cambiar contraseña'}
              </button>
            </form>
          )}

          <p className="small" style={{ textAlign: 'center', marginTop: '18px' }}>
            <Link to="/login">Volver a iniciar sesión</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
