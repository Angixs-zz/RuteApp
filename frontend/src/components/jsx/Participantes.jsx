import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/styles.css'; 
import logoImg from '../../assets/react.svg'; // Usamos el logo de React por defecto temporalmente
import ConfirmModal from './ConfirmModal';

export default function Participantes() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [cancelTripOpen, setCancelTripOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deletePersonOpen, setDeletePersonOpen] = useState(false);

  const handleCancelTrip = () => {
    // Lógica para cancelar el viaje
    setCancelTripOpen(false);
  };

  const handleDeletePerson = () => {
    // Lógica para eliminar participante
    setDeletePersonOpen(false);
  };

  return (
    <>
      <header className="app-nav">
        <div className="container">
          <Link className="brand compact" to="/dashboard">
            <img src={logoImg} alt="RuteApp" />
          </Link>
          <nav className="app-links">
            <Link className="" to="/dashboard">Inicio</Link>
            <Link className="active" to="/viajes">Mis viajes</Link>
            <Link className="" to="/invitaciones">Invitaciones <span className='nav-badge'>2</span></Link>
            <Link className="" to="/gastos">Gastos</Link>
          </nav>
          <div className="user-menu">
            <button className="icon-btn">🔔<span className="count">3</span></button>
            <img className="avatar" src={logoImg} alt="Avatar" />
            <div className="user-copy">
              <strong>Miguel Ángel</strong>
              <span>miguel@ruteapp.mx</span>
            </div>
            <button className="icon-btn" onClick={() => setProfileMenuOpen(!profileMenuOpen)}>⌄</button>
            <button className="icon-btn mobile-toggle">☰</button>
          </div>
        </div>
      </header>

      {profileMenuOpen && (
        <div className="modal-backdrop" id="profileMenu" onClick={() => setProfileMenuOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">👤</div>
            <h3>Cuenta</h3>
            <p className="muted">Accede a tu perfil o cierra la sesión actual.</p>
            <div className="modal-actions">
              <Link className="button ghost" to="/perfil">Mi perfil</Link>
              <Link className="button danger" to="/login">Cerrar sesión</Link>
            </div>
          </div>
        </div>
      )}

      <main className="page">
        <div className="container">
          <section className="trip-hero">
            <div className="trip-hero-content">
              <div>
                <span className="status confirmed">Confirmado</span>
                <h1>Escapada a Cancún</h1>
                <p>Quintana Roo, México · 12–16 de agosto de 2026</p>
              </div>
              <button className="button ghost" onClick={() => setCancelTripOpen(true)}>Cancelar viaje</button>
            </div>
          </section>

          {/* Reutilizamos el ConfirmModal que creamos anteriormente para cancelar viaje */}
          <ConfirmModal 
            isOpen={cancelTripOpen}
            title="¿Cancelar este viaje?"
            message="Los participantes recibirán una notificación y el viaje cambiará al estado cancelado."
            confirmText="Cancelar viaje"
            cancelText="Volver"
            onConfirm={handleCancelTrip}
            onCancel={() => setCancelTripOpen(false)}
          />

          <nav className="tabs">
            <Link className="" to="/detalle-viaje">Resumen</Link>
            <Link className="active" to="/participantes">Participantes</Link>
            <Link className="" to="/itinerario">Itinerario</Link>
            <Link className="" to="/gastos">Gastos</Link>
            <Link className="" to="/notificaciones">Notificaciones</Link>
          </nav>

          <section className="content-card">
            <div className="section-title">
              <div>
                <h2>Participantes e invitaciones</h2>
                <p className="muted small">Administra quién forma parte del viaje.</p>
              </div>
              <button className="button primary" onClick={() => setInviteModalOpen(true)}>
                ＋ Invitar participante
              </button>
            </div>
            
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Participante</th>
                    <th>Teléfono</th>
                    <th>Rol en el viaje</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="user-cell">
                        <img src={logoImg} alt="Avatar" />
                        <div>
                          <strong>Miguel Ángel</strong><br/>
                          <span className="muted">miguel@ruteapp.mx</span>
                        </div>
                      </div>
                    </td>
                    <td>951 000 0000</td>
                    <td>Organizador</td>
                    <td><span className="status confirmed">Confirmado</span></td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="user-cell">
                        <img src={logoImg} alt="Avatar" />
                        <div>
                          <strong>Yareli Martínez</strong><br/>
                          <span className="muted">yareli@ruteapp.mx</span>
                        </div>
                      </div>
                    </td>
                    <td>951 111 1111</td>
                    <td>Participante</td>
                    <td><span className="status confirmed">Confirmado</span></td>
                    <td><button className="button ghost small">Editar</button></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="user-cell">
                        <img src={logoImg} alt="Avatar" />
                        <div>
                          <strong>Jorge Pérez</strong><br/>
                          <span className="muted">jorge@ejemplo.com</span>
                        </div>
                      </div>
                    </td>
                    <td>951 222 2222</td>
                    <td>Participante</td>
                    <td><span className="status pending">Pendiente</span></td>
                    <td><button className="button ghost small">Reenviar</button></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="user-cell">
                        <img src={logoImg} alt="Avatar" />
                        <div>
                          <strong>Ana López</strong><br/>
                          <span className="muted">ana@ejemplo.com</span>
                        </div>
                      </div>
                    </td>
                    <td>951 333 3333</td>
                    <td>Participante</td>
                    <td><span className="status cancelled">Rechazado</span></td>
                    <td><button className="button danger small" onClick={() => setDeletePersonOpen(true)}>Eliminar</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Modal de Invitación nativo en el componente */}
          {inviteModalOpen && (
            <div className="modal-backdrop" id="inviteModal" onClick={() => setInviteModalOpen(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon">✉️</div>
                <h3>Invitar participante</h3>
                <label className="field">
                  <span>Correo o teléfono</span>
                  <input placeholder="persona@ejemplo.com" />
                </label>
                <label className="field">
                  <span>Mensaje</span>
                  <textarea defaultValue="Te invito a formar parte de nuestro viaje a Cancún." />
                </label>
                <div className="modal-actions">
                  <button className="button ghost" onClick={() => setInviteModalOpen(false)}>Cancelar</button>
                  <button className="button primary" onClick={() => setInviteModalOpen(false)}>Enviar invitación</button>
                </div>
              </div>
            </div>
          )}

          {/* Reutilizamos el ConfirmModal para eliminar participante */}
          <ConfirmModal 
            isOpen={deletePersonOpen}
            title="Eliminar participante"
            message="Esta persona dejará de tener acceso al viaje."
            confirmText="Eliminar"
            cancelText="Cancelar"
            onConfirm={handleDeletePerson}
            onCancel={() => setDeletePersonOpen(false)}
          />

        </div>
      </main>
      <div className="toast"></div>
    </>
  );
}
