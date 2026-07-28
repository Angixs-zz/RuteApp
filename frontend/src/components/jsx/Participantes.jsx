import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../css/styles.css'; 
import logoImg from '../../assets/logo.jpeg'; 
import ConfirmModal from './ConfirmModal';
import Navbar from './Navbar';
import TripHeader from './TripHeader';
import api from '../../service/api';

export default function Participantes() {
  const { id } = useParams();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deletePersonOpen, setDeletePersonOpen] = useState(false);
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const fetchParticipantes = async () => {
      try {
        const res = await api.get(`/participantes/viaje/${id}`, { timeout: 1500 });
        setParticipantes(res.data || []);
      } catch (err) {
        console.error("Error cargando participantes", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchParticipantes();
  }, [id]);

  const handleDeletePerson = () => {
    // Lógica para eliminar participante
    setDeletePersonOpen(false);
  };

  const getAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;

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
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Cargando participantes...</div>
              ) : fetchError ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>
                  ⚠️ No se pudo conectar con el servidor. Revisa si el backend está encendido.
                </div>
              ) : participantes.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Aún no hay participantes en este viaje.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Participante</th>
                      <th>Teléfono</th>
                      <th>Estado</th>
                      <th>Permisos</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantes.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="user-cell">
                            <img src={getAvatar(p.usuario?.nombre)} alt="Avatar" />
                            <div>
                              <strong>{p.usuario?.nombre}</strong><br/>
                              <span className="muted">{p.usuario?.correo}</span>
                            </div>
                          </div>
                        </td>
                        <td>{p.usuario?.telefono || '-'}</td>
                        <td>
                          <span className={`status ${p.estadoInvitacion === 'ACEPTADA' ? 'confirmed' : 'pending'}`}>
                            {p.estadoInvitacion || 'Pendiente'}
                          </span>
                        </td>
                        <td>{p.permisoColaborar ? 'Colaborador' : 'Lector'}</td>
                        <td>
                          <button className="button danger small" onClick={() => setDeletePersonOpen(true)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
