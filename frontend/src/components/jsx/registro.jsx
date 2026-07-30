import { useContext, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import '../css/styles.css'; 
import logoImg from '../../assets/logo.jpeg'; 
import api from '../../service/api';
import { AuthContext } from '../../context/AuthContext';
import { esTelefonoValido, normalizarTelefono } from '../../utils/telefono';

export default function Registro() {
  const { loginContext } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rolId, setRolId] = useState('2');
  
  const [errorNombre, setErrorNombre] = useState('');
  const [errorCorreo, setErrorCorreo] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorTelefono, setErrorTelefono] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [loading, setLoading] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleRegister = async (e) => {
    e.preventDefault();
    
    setErrorNombre('');
    setErrorCorreo('');
    setErrorPassword('');
    setErrorTelefono('');
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
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      setErrorCorreo('El formato del correo no es válido.');
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

    const telefonoNormalizado = normalizarTelefono(telefono);
    if (!esTelefonoValido(telefonoNormalizado)) {
      setErrorTelefono('Usa 10 dígitos mexicanos o formato internacional.');
      hayErrores = true;
    }

    if (hayErrores) return;

    setLoading(true);
    try {
      await api.post('/usuarios', {
        nombre,
        correo,
        password,
        telefono: telefonoNormalizado,
        rolId: Number(rolId)
      });

      setMensajeExito('¡Registro exitoso! Ya puedes iniciar sesión.');
      setNombre('');
      setCorreo('');
      setPassword('');
      setTelefono('');
      setRolId('2');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error(error);
      if (!error.response) {
        setErrorGeneral('Error de conexión: El servidor no está respondiendo.');
      } else {
        setErrorGeneral('Error al registrarse. Es posible que el correo ya esté registrado o los datos sean inválidos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      setErrorGeneral('Google no devolvió una credencial válida. Inténtalo de nuevo.');
      return;
    }

    setErrorGeneral('');
    setMensajeExito('');
    setLoading(true);

    try {
      const response = await api.post('/auth/google', {
        credential: credentialResponse.credential
      });
      loginContext(response.data);
      setMensajeExito('¡Cuenta creada correctamente!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      if (!error.response) {
        setErrorGeneral('Error de conexión: El servidor no está respondiendo.');
      } else {
        setErrorGeneral(error.response.data?.mensaje || 'No se pudo crear la cuenta con Google.');
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

            <label className={`field ${errorTelefono ? 'error' : ''}`}>
              <span>Teléfono</span>
              <input 
                type="tel" 
                value={telefono} 
                onChange={(e) => {
                  setTelefono(e.target.value);
                  setErrorTelefono('');
                }}
                placeholder="+5219511168398"
              />
              {errorTelefono && <span className="error-text">{errorTelefono}</span>}
              <span className="muted small">Opcional. Se usa para notificaciones por WhatsApp.</span>
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
              <span>Tipo de Usuario / Rol</span>
              <select 
                value={rolId} 
                onChange={(e) => setRolId(e.target.value)}
              >
                <option value="2">USUARIO</option>
                <option value="3">AGENCIA</option>
              </select>
            </label>

            <button type="submit" className="button primary full" style={{ marginTop: '18px' }} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            <div className="separator">o continúa con</div>
            {googleClientId ? (
              <div className={`google-login ${loading ? 'disabled' : ''}`}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErrorGeneral('No se pudo crear la cuenta con Google.')}
                  text="continue_with"
                  shape="rectangular"
                  size="large"
                  width="400"
                  locale="es"
                />
              </div>
            ) : (
              <p className="google-config-warning">
                Configura VITE_GOOGLE_CLIENT_ID para habilitar Google.
              </p>
            )}

            <p className="small" style={{ textAlign: 'center', marginTop: '18px' }}>
              ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
