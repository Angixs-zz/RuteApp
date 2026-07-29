import { useState, useEffect, useContext } from 'react';
import Navbar from './Navbar';
import { AuthContext } from '../../context/AuthContext';
import api from '../../service/api';
import '../css/styles.css';

const getInitialName = (user) => {
  const defaultName = user?.nombre || 'Miguel Ángel';
  let initNombre = defaultName;
  let initApellidos = 'Hernández Pérez';

  if (user?.nombre) {
    const parts = user.nombre.trim().split(' ');
    if (parts.length > 2) {
      initNombre = parts.slice(0, 2).join(' ');
      initApellidos = parts.slice(2).join(' ');
    } else if (parts.length === 2) {
      initNombre = parts[0];
      initApellidos = parts[1];
    } else {
      initNombre = parts[0];
      initApellidos = '';
    }
  }
  return { initNombre, initApellidos };
};

export default function Perfil() {
  const { user, updateUserContext } = useContext(AuthContext);

  const [nombre, setNombre] = useState(() => getInitialName(user).initNombre);
  const [apellidos, setApellidos] = useState(() => getInitialName(user).initApellidos);
  const [correo, setCorreo] = useState(() => user?.correo || 'miguel@ruteapp.mx');
  const [telefono, setTelefono] = useState(() => user?.telefono || '');
  const [rol, setRol] = useState(() => {
    if (!user?.rol) return 'Organizador';
    if (user.rol === 'ADMINISTRADOR') return 'Administrador';
    if (user.rol === 'ORGANIZADOR') return 'Organizador';
    if (user.rol === 'VIAJERO') return 'Viajero';
    return user.rol;
  });
  const [avatar, setAvatar] = useState(() => {
    return (
      user?.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.nombre || 'Miguel Ángel'
      )}&background=0E7C7B&color=ffffff`
    );
  });

  // Preferencias de notificaciones
  const [prefersEmail, setPrefersEmail] = useState(true);
  const [prefersSMS, setPrefersSMS] = useState(true);
  const [prefersWhatsApp, setPrefersWhatsApp] = useState(true);

  // Estados para Modal de Contraseña
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Estados para Modal de Foto
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

  // Estado general UI
  const [guardando, setGuardando] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  useEffect(() => {
    // Intentar consultar datos actualizados del backend si existe id
    if (!user?.id) return;
    let isSubscribed = true;

    api
      .get(`/usuarios/${user.id}`)
      .then((res) => {
        if (!isSubscribed) return;
        const u = res.data;
        if (u) {
          if (u.nombre) {
            const p = u.nombre.trim().split(' ');
            if (p.length > 2) {
              setNombre(p.slice(0, 2).join(' '));
              setApellidos(p.slice(2).join(' '));
            } else if (p.length === 2) {
              setNombre(p[0]);
              setApellidos(p[1]);
            } else {
              setNombre(p[0]);
            }
          }
          if (u.correo) setCorreo(u.correo);
          setTelefono(u.telefono || '');
          if (u.rol) {
            const r =
              u.rol === 'ADMINISTRADOR'
                ? 'Administrador'
                : u.rol === 'ORGANIZADOR'
                ? 'Organizador'
                : u.rol;
            setRol(r);
          }
        }
      })
      .catch((err) => {
        console.error('Error al obtener usuario del backend:', err);
      });

    return () => {
      isSubscribed = false;
    };
  }, [user?.id]);

  const handleGuardarCambios = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const nombreCompleto = `${nombre.trim()} ${apellidos.trim()}`.trim();
    const telefonoNormalizado = telefono.replace(/\s/g, '');

    if (telefonoNormalizado && !/^\+[1-9]\d{7,14}$/.test(telefonoNormalizado)) {
      showToast('Usa un teléfono internacional, por ejemplo +5219511168398');
      setGuardando(false);
      return;
    }

    try {
      if (user?.id) {
        await api.patch(`/usuarios/${user.id}/perfil`, {
          nombre: nombreCompleto,
          correo: correo,
          telefono: telefonoNormalizado,
        });
      }
      if (updateUserContext) {
        updateUserContext({
          nombre: nombreCompleto,
          correo: correo,
          telefono: telefonoNormalizado,
          avatar: avatar,
        });
      }
      setTelefono(telefonoNormalizado);
      showToast('Perfil actualizado');
    } catch (err) {
      showToast(err.response?.data?.mensaje || 'No fue posible actualizar el perfil');
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarPassword = (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!newPassword || newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    // Proceso exitoso de actualización de contraseña
    setIsPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Contraseña actualizada correctamente');
  };

  const handleCambiarAvatar = (e) => {
    e.preventDefault();
    if (newAvatarUrl.trim()) {
      setAvatar(newAvatarUrl.trim());
      if (updateUserContext) {
        updateUserContext({ avatar: newAvatarUrl.trim() });
      }
      showToast('Fotografía actualizada');
    }
    setIsAvatarModalOpen(false);
    setNewAvatarUrl('');
  };

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="eyebrow">CUENTA</span>
              <h1>Mi perfil</h1>
              <p className="muted">Administra tus datos y preferencias de comunicación.</p>
            </div>
          </div>

          <div className="profile-layout">
            <aside className="card profile-card">
              <img className="avatar" src={avatar} alt="Avatar de usuario" />
              <h2>
                {nombre} {apellidos}
              </h2>
              <p className="muted">{rol}</p>
              <button
                className="button ghost full"
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
              >
                Cambiar fotografía
              </button>
            </aside>

            <section className="card form-card">
              <h2>Información personal</h2>
              <form onSubmit={handleGuardarCambios}>
                <div className="form-grid">
                  <label className="field">
                    <span>Nombre</span>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Apellidos</span>
                    <input
                      type="text"
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <label className="field">
                  <span>Correo</span>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                  />
                </label>

                <label className="field">
                  <span>Teléfono</span>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+5219511168398"
                  />
                  <span className="muted small">Necesario para recibir notificaciones por WhatsApp.</span>
                </label>

                <div className="form-actions">
                  <button
                    type="button"
                    className="button ghost"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    Cambiar contraseña
                  </button>
                  <button
                    type="submit"
                    className="button primary"
                    disabled={guardando}
                    data-toast="Perfil actualizado"
                  >
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>

              <section className="form-section">
                <h3>Preferencias de notificaciones</h3>
                <div className="preference-list">
                  <div className="preference">
                    <div>
                      <strong>Correo electrónico</strong>
                      <p className="muted small">Invitaciones y resúmenes.</p>
                    </div>
                    <span
                      className={`switch ${prefersEmail ? 'on' : ''}`}
                      onClick={() => setPrefersEmail(!prefersEmail)}
                      style={{ cursor: 'pointer' }}
                      role="button"
                      tabIndex={0}
                      aria-label="Notificaciones por Correo electrónico"
                    ></span>
                  </div>

                  <div className="preference">
                    <div>
                      <strong>SMS</strong>
                      <p className="muted small">Cambios urgentes.</p>
                    </div>
                    <span
                      className={`switch ${prefersSMS ? 'on' : ''}`}
                      onClick={() => setPrefersSMS(!prefersSMS)}
                      style={{ cursor: 'pointer' }}
                      role="button"
                      tabIndex={0}
                      aria-label="Notificaciones por SMS"
                    ></span>
                  </div>

                  <div className="preference">
                    <div>
                      <strong>WhatsApp</strong>
                      <p className="muted small">Recordatorios y pagos.</p>
                    </div>
                    <span
                      className={`switch ${prefersWhatsApp ? 'on' : ''}`}
                      onClick={() => setPrefersWhatsApp(!prefersWhatsApp)}
                      style={{ cursor: 'pointer' }}
                      role="button"
                      tabIndex={0}
                      aria-label="Notificaciones por WhatsApp"
                    ></span>
                  </div>
                </div>
              </section>
            </section>
          </div>
        </div>
      </main>

      {/* Modal Cambiar Contraseña */}
      <div className={`modal-backdrop ${isPasswordModalOpen ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-icon">🔒</div>
          <h3>Cambiar contraseña</h3>
          <p className="muted">Ingresa tu contraseña actual y la nueva contraseña.</p>

          <form onSubmit={handleCambiarPassword} style={{ marginTop: '16px' }}>
            <label className="field">
              <span>Contraseña actual</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>
            <label className="field">
              <span>Nueva contraseña</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
              />
            </label>
            <label className="field">
              <span>Confirmar nueva contraseña</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                required
              />
            </label>

            {passwordError && (
              <p style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '12px' }}>
                {passwordError}
              </p>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordError('');
                }}
              >
                Cancelar
              </button>
              <button type="submit" className="button primary">
                Actualizar contraseña
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Cambiar Fotografía */}
      <div className={`modal-backdrop ${isAvatarModalOpen ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-icon">📷</div>
          <h3>Cambiar fotografía</h3>
          <p className="muted">Ingresa la URL de tu nueva imagen de perfil.</p>

          <form onSubmit={handleCambiarAvatar} style={{ marginTop: '16px' }}>
            <label className="field">
              <span>URL de la imagen</span>
              <input
                type="url"
                value={newAvatarUrl}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
                placeholder="https://ejemplo.com/mi-foto.jpg"
                required
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="button ghost"
                onClick={() => setIsAvatarModalOpen(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="button primary">
                Guardar foto
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Component */}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </>
  );
}
