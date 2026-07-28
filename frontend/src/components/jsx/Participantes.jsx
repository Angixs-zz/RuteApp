import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../css/styles.css'; 
import logoImg from '../../assets/logo.jpeg'; 
import ConfirmModal from './ConfirmModal';
import Navbar from './Navbar';
import TripHeader from './TripHeader';

export default function Participantes() {
  const { id } = useParams();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deletePersonOpen, setDeletePersonOpen] = useState(false);

  const handleDeletePerson = () => {
    // Lógica para eliminar participante
    setDeletePersonOpen(false);
  };

  const getAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="container">
          
          <TripHeader id={id} currentTab="participantes" />

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
                        <img src={getAvatar('Miguel Ángel')} alt="Avatar" />
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
                        <img src={getAvatar('Yareli Martínez')} alt="Avatar" />
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
                        <img src={getAvatar('Jorge Pérez')} alt="Avatar" />
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
                        <img src={getAvatar('Ana López')} alt="Avatar" />
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
