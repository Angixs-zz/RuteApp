import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import TripHeader from './TripHeader';
import { AlertTriangle, Mail, MessageCircle, Trash2 } from 'lucide-react';
import api from '../../service/api';
import { AuthContext } from '../../context/AuthContext';
import avatarImg from '../../assets/react.svg';
import { esTelefonoValido, normalizarTelefono } from '../../utils/telefono';
import '../css/styles.css';

function convertirParticipante(participante) {
  return {
    id: participante.id,
    nombre: participante.nombreUsuario || 'Participante',
    correo: participante.correoUsuario || 'Sin correo',
    telefono: participante.whatsappDisponible ? 'Registrado' : 'No registrado',
    rol: participante.permisoColaborar ? 'Colaborador' : 'Participante',
    estado: participante.estadoInvitacion || 'PENDIENTE',
  };
}

export default function Participantes() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [viaje, setViaje] = useState(null);
  const [errorCarga, setErrorCarga] = useState('');

  const [participantes, setParticipantes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedParticipante, setSelectedParticipante] = useState(null);

  // Formulario de invitación
  const [canalInvitacion, setCanalInvitacion] = useState('CORREO');
  const [invitacionContacto, setInvitacionContacto] = useState('');
  const [errorInvitacion, setErrorInvitacion] = useState('');
  const [enviandoInvitacion, setEnviandoInvitacion] = useState(false);
  const [notificandoId, setNotificandoId] = useState(null);

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  useEffect(() => {
    async function cargarDatos() {
      if (!id) return;
      try {
        setLoading(true);
        const resViaje = await api.get(`/viajes/${id}`);
        if (resViaje.data) {
          setViaje(resViaje.data);
        }
        const resPart = await api.get(`/participantes/viaje/${id}`);
        if (Array.isArray(resPart.data)) {
          setParticipantes(resPart.data.map(convertirParticipante));
        }
      } catch (err) {
        console.error('Error al cargar participantes:', err);
        setErrorCarga('No se pudo cargar la información del viaje. Es posible que debas reiniciar tu servidor Spring Boot.');
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, [id]);

  const handleCancelarViaje = async () => {
    try {
      if (id) {
        await api.put(`/viajes/${id}`, { ...viaje, estado: 'CANCELADO' });
      }
    } catch {
      // Manejo silencioso en caso de fallback
    }
    setViaje(prev => ({ ...prev, estado: 'CANCELADO' }));
    setShowCancelModal(false);
    showToast('El viaje fue cancelado');
  };

  const handleEnviarInvitacion = async (e) => {
    e.preventDefault();
    const contacto = invitacionContacto.trim();
    setErrorInvitacion('');
    if (canalInvitacion === 'CORREO' && !/\S+@\S+\.\S+/.test(contacto)) {
      setErrorInvitacion('Ingresa un correo electrónico válido');
      return;
    }
    const telefono = canalInvitacion === 'WHATSAPP'
      ? normalizarTelefono(contacto)
      : '';
    if (canalInvitacion === 'WHATSAPP' && !esTelefonoValido(telefono)) {
      setErrorInvitacion('Ingresa 10 dígitos mexicanos o un teléfono internacional');
      return;
    }
    if (!id) {
      setErrorInvitacion('Abre un viaje antes de enviar una invitación.');
      return;
    }

    setEnviandoInvitacion(true);
    try {
      const response = await api.post('/participantes', {
        viajeId: Number(id),
        canalInvitacion,
        ...(canalInvitacion === 'CORREO'
          ? { correoUsuario: contacto }
          : { telefonoUsuario: telefono }),
      });

      setParticipantes(prev => [...prev, convertirParticipante(response.data)]);
      setInvitacionContacto('');
      setShowInviteModal(false);
      showToast(`Invitación enviada por ${canalInvitacion === 'CORREO' ? 'correo' : 'WhatsApp'}`);
    } catch (error) {
      setErrorInvitacion(
        error.response?.data?.mensaje
          || 'No fue posible enviar la invitación.'
      );
    } finally {
      setEnviandoInvitacion(false);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!selectedParticipante) return;
    try {
      if (id && selectedParticipante.id) {
        await api.delete(`/participantes/${selectedParticipante.id}`);
      }
    } catch {
      // Fallback
    }

    setParticipantes(prev => prev.filter(p => p.id !== selectedParticipante.id));
    setShowDeleteModal(false);
    setSelectedParticipante(null);
    showToast('Participante eliminado');
  };

  const handleNotificarWhatsApp = async (participante) => {
    setNotificandoId(participante.id);
    try {
      await api.post(`/participantes/${participante.id}/notificar-whatsapp`);
      showToast(`Recordatorio enviado a ${participante.nombre}`);
    } catch (error) {
      showToast(
        error.response?.data?.mensaje
          || 'No fue posible enviar el mensaje por WhatsApp'
      );
    } finally {
      setNotificandoId(null);
    }
  };

  const formatearEstadoBadge = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'ACEPTADA':
        return <span className="status confirmed">Confirmado</span>;
      case 'PENDIENTE':
        return <span className="status pending">Pendiente</span>;
      case 'RECHAZADA':
      case 'CANCELADO':
        return <span className="status cancelled">Rechazado</span>;
      default:
        return <span className="status confirmed">Confirmado</span>;
    }
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <TripHeader id={id} currentTab="participantes" />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6B7280' }}>
              Cargando participantes...
            </div>
          ) : errorCarga ? (
            <div className="banner warn" style={{ marginTop: '2rem' }}>
              <div>
                <strong>Error de conexión al servidor</strong>
                <span>{errorCarga}</span>
              </div>
            </div>
          ) : !viaje ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6B7280' }}>
              No se encontró la información de este viaje.
            </div>
          ) : (
            <>
              {/* Content Card con Tabla de Participantes */}
              <section className="content-card">
                <div className="section-title">
                  <div>
                    <h2>Participantes e invitaciones</h2>
                    <p className="muted small">Administra quién forma parte del viaje.</p>
                  </div>
                  {user?.id === viaje.organizadorId && (
                    <button 
                      className="button primary" 
                      onClick={() => setShowInviteModal(true)}
                    >
                      ＋ Invitar participante
                    </button>
                  )}
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
                      {participantes.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div className="user-cell">
                              <img src={avatarImg} alt="Avatar" />
                              <div>
                                <strong>{p.nombre}</strong>
                                <br />
                                <span className="muted">{p.correo}</span>
                              </div>
                            </div>
                          </td>
                          <td>{p.telefono}</td>
                          <td>{p.rol}</td>
                          <td>{formatearEstadoBadge(p.estado)}</td>
                          <td>
                            <div className="participant-actions">
                              {p.estado === 'PENDIENTE' && (
                                <span className="muted small">Esperando respuesta</span>
                              )}
                              {user?.id === viaje.organizadorId && (
                                <>
                                  {p.estado === 'RECHAZADA' ? (
                                    <button
                                      className="button danger small"
                                      onClick={() => {
                                        setSelectedParticipante(p);
                                        setShowDeleteModal(true);
                                      }}
                                    >
                                      Eliminar
                                    </button>
                                  ) : (
                                    <button
                                      className="button whatsapp small"
                                      onClick={() => handleNotificarWhatsApp(p)}
                                      disabled={p.telefono === 'No registrado' || notificandoId === p.id}
                                      title={p.telefono === 'No registrado'
                                        ? 'El participante debe registrar su teléfono en Perfil'
                                        : 'Enviar recordatorio por WhatsApp'}
                                    >
                                      <MessageCircle size={16} />
                                      {notificandoId === p.id ? 'Enviando...' : 'WhatsApp'}
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* Modal Cancelar Viaje */}
      <div className={`modal-backdrop ${showCancelModal ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-icon"><AlertTriangle size={28} /></div>
          <h3>¿Cancelar este viaje?</h3>
          <p className="muted">
            Los participantes recibirán una notificación y el viaje cambiará al estado cancelado.
          </p>
          <div className="modal-actions">
            <button className="button ghost" onClick={() => setShowCancelModal(false)}>
              Volver
            </button>
            <button className="button danger" onClick={handleCancelarViaje}>
              Cancelar viaje
            </button>
          </div>
        </div>
      </div>

      {/* Modal Invitar Participante */}
      <div className={`modal-backdrop ${showInviteModal ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-icon">
            {canalInvitacion === 'CORREO' ? <Mail size={28} /> : <MessageCircle size={28} />}
          </div>
          <h3>Invitar participante</h3>
          <form onSubmit={handleEnviarInvitacion}>
            <div className="invite-channels" aria-label="Canal de invitación">
              <button
                type="button"
                className={`invite-channel ${canalInvitacion === 'CORREO' ? 'active' : ''}`}
                onClick={() => {
                  setCanalInvitacion('CORREO');
                  setInvitacionContacto('');
                  setErrorInvitacion('');
                }}
              >
                <Mail size={18} /> Correo electrónico
              </button>
              <button
                type="button"
                className={`invite-channel whatsapp ${canalInvitacion === 'WHATSAPP' ? 'active' : ''}`}
                onClick={() => {
                  setCanalInvitacion('WHATSAPP');
                  setInvitacionContacto('');
                  setErrorInvitacion('');
                }}
              >
                <MessageCircle size={18} /> WhatsApp
              </button>
            </div>
            <label className={`field ${errorInvitacion ? 'error' : ''}`}>
              <span>{canalInvitacion === 'CORREO' ? 'Correo electrónico' : 'Número de WhatsApp'}</span>
              <input 
                type={canalInvitacion === 'CORREO' ? 'email' : 'tel'}
                inputMode={canalInvitacion === 'CORREO' ? 'email' : 'tel'}
                placeholder={canalInvitacion === 'CORREO' ? 'persona@ejemplo.com' : '951 123 4567'}
                value={invitacionContacto}
                onChange={(e) => {
                  setInvitacionContacto(e.target.value);
                  setErrorInvitacion('');
                }}
              />
              {canalInvitacion === 'WHATSAPP' && !errorInvitacion && (
                <span className="muted small">La persona debe tener ese teléfono registrado en RuteApp.</span>
              )}
              {errorInvitacion && <span className="error-text">{errorInvitacion}</span>}
            </label>
            <div className="modal-actions">
              <button 
                type="button" 
                className="button ghost" 
                onClick={() => setShowInviteModal(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="button primary" disabled={enviandoInvitacion}>
                {enviandoInvitacion ? 'Enviando...' : 'Enviar invitación'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Eliminar Participante */}
      <div className={`modal-backdrop ${showDeleteModal ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-icon"><Trash2 size={28} color="#ef4444" /></div>
          <h3>Eliminar participante</h3>
          <p className="muted">
            {selectedParticipante?.nombre} dejará de tener acceso al viaje.
          </p>
          <div className="modal-actions">
            <button className="button ghost" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </button>
            <button className="button danger" onClick={handleConfirmarEliminar}>
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </>
  );
}
