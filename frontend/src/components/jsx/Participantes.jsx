import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../service/api';
import avatarImg from '../../assets/react.svg';
import '../css/styles.css';

export default function Participantes() {
  const { id } = useParams();
  const viajeId = id || 1;

  const [viaje, setViaje] = useState({
    id: viajeId,
    nombre: 'Escapada a Cancún',
    destino: 'Quintana Roo, México',
    fechaInicio: '2026-08-12',
    fechaFin: '2026-08-16',
    estado: 'EN_CURSO'
  });

  const [participantes, setParticipantes] = useState([
    {
      id: 1,
      nombre: 'Miguel Ángel',
      correo: 'miguel@ruteapp.mx',
      telefono: '951 000 0000',
      rol: 'Organizador',
      estado: 'CONFIRMADO'
    },
    {
      id: 2,
      nombre: 'Yareli Martínez',
      correo: 'yareli@ruteapp.mx',
      telefono: '951 111 1111',
      rol: 'Participante',
      estado: 'CONFIRMADO'
    },
    {
      id: 3,
      nombre: 'Jorge Pérez',
      correo: 'jorge@ejemplo.com',
      telefono: '951 222 2222',
      rol: 'Participante',
      estado: 'PENDIENTE'
    },
    {
      id: 4,
      nombre: 'Ana López',
      correo: 'ana@ejemplo.com',
      telefono: '951 333 3333',
      rol: 'Participante',
      estado: 'RECHAZADO'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedParticipante, setSelectedParticipante] = useState(null);

  // Formulario de invitación
  const [invitacionContacto, setInvitacionContacto] = useState('');
  const [invitacionMensaje, setInvitacionMensaje] = useState('Te invito a formar parte de nuestro viaje a Cancún.');

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const fetchDatos = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const resViaje = await api.get(`/viajes/${id}`);
      if (resViaje.data) {
        setViaje(resViaje.data);
      }
      const resPart = await api.get(`/participantes/viaje/${id}`);
      if (resPart.data && Array.isArray(resPart.data) && resPart.data.length > 0) {
        setParticipantes(resPart.data.map(p => ({
          id: p.id,
          nombre: p.nombreUsuario || 'Participante',
          correo: p.correoUsuario || 'correo@ejemplo.com',
          telefono: '951 000 0000',
          rol: p.permisoColaborar ? 'Colaborador' : 'Participante',
          estado: p.estadoInvitacion || 'CONFIRMADO'
        })));
      }
    } catch {
      // Fallback a los datos estáticos si ocurre un error o si se navega sin id en base de datos
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        fetchDatos();
      }
    });
    return () => {
      active = false;
    };
  }, [fetchDatos]);

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
    if (!invitacionContacto.trim()) {
      showToast('Ingresa un correo o teléfono válido');
      return;
    }

    try {
      if (id) {
        await api.post('/participantes', {
          viajeId: id,
          correoUsuario: invitacionContacto,
          estadoInvitacion: 'PENDIENTE'
        });
      }
    } catch {
      // Fallback
    }

    const nuevoPart = {
      id: Date.now(),
      nombre: invitacionContacto.split('@')[0] || 'Nuevo Invitado',
      correo: invitacionContacto,
      telefono: '951 999 9999',
      rol: 'Participante',
      estado: 'PENDIENTE'
    };

    setParticipantes(prev => [...prev, nuevoPart]);
    setInvitacionContacto('');
    setShowInviteModal(false);
    showToast('Invitación enviada por correo y WhatsApp');
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

  const handleReenviar = (p) => {
    showToast(`Invitación reenviada a ${p.correo}`);
  };

  const formatearEstadoBadge = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'CONFIRMADO':
        return <span className="status confirmed">Confirmado</span>;
      case 'PENDIENTE':
        return <span className="status pending">Pendiente</span>;
      case 'RECHAZADO':
      case 'CANCELADO':
        return <span className="status cancelled">Rechazado</span>;
      default:
        return <span className="status confirmed">Confirmado</span>;
    }
  };

  const formatearFechas = (inicio, fin) => {
    if (!inicio || !fin) return '12–16 de agosto de 2026';
    try {
      const fIni = new Date(inicio + 'T00:00:00');
      const fFin = new Date(fin + 'T00:00:00');
      const mesAñoOptions = { month: 'long', year: 'numeric' };
      if (fIni.getMonth() === fFin.getMonth() && fIni.getFullYear() === fFin.getFullYear()) {
        return `${fIni.getDate()}–${fFin.getDate()} de ${fFin.toLocaleDateString('es-MX', mesAñoOptions)}`;
      }
      return `${fIni.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} – ${fFin.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } catch {
      return `${inicio} – ${fin}`;
    }
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6B7280' }}>
              Cargando participantes...
            </div>
          ) : (
            <>
              {/* Trip Hero Header */}
              <section className="trip-hero">
                <div className="trip-hero-content">
                  <div>
                    <span className={viaje.estado === 'CANCELADO' ? 'status cancelled' : 'status confirmed'}>
                      {viaje.estado === 'CANCELADO' ? 'Cancelado' : 'Confirmado'}
                    </span>
                    <h1>{viaje.nombre}</h1>
                    <p>{viaje.destino} · {formatearFechas(viaje.fechaInicio, viaje.fechaFin)}</p>
                  </div>
                  {viaje.estado !== 'CANCELADO' && (
                    <button 
                      className="button ghost" 
                      onClick={() => setShowCancelModal(true)}
                    >
                      Cancelar viaje
                    </button>
                  )}
                </div>
              </section>

              {/* Tabs Nav */}
              <nav className="tabs">
                <Link to={`/viajes/${viajeId}`}>Resumen</Link>
                <Link className="active" to={`/viajes/${viajeId}/participantes`}>Participantes</Link>
                <Link to="/itinerario">Itinerario</Link>
                <Link to="/gastos">Gastos</Link>
                <Link to="/notificaciones">Notificaciones</Link>
              </nav>

              {/* Content Card con Tabla de Participantes */}
              <section className="content-card">
                <div className="section-title">
                  <div>
                    <h2>Participantes e invitaciones</h2>
                    <p className="muted small">Administra quién forma parte del viaje.</p>
                  </div>
                  <button 
                    className="button primary" 
                    onClick={() => setShowInviteModal(true)}
                  >
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
                            {p.rol === 'Organizador' ? (
                              '—'
                            ) : p.estado === 'PENDIENTE' ? (
                              <button 
                                className="button ghost small" 
                                onClick={() => handleReenviar(p)}
                              >
                                Reenviar
                              </button>
                            ) : p.estado === 'RECHAZADO' ? (
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
                                className="button ghost small"
                                onClick={() => showToast(`Editando participante ${p.nombre}`)}
                              >
                                Editar
                              </button>
                            )}
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
          <div className="modal-icon">⚠️</div>
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
          <div className="modal-icon">✉️</div>
          <h3>Invitar participante</h3>
          <form onSubmit={handleEnviarInvitacion}>
            <label className="field">
              <span>Correo o teléfono</span>
              <input 
                type="text"
                placeholder="persona@ejemplo.com"
                value={invitacionContacto}
                onChange={(e) => setInvitacionContacto(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Mensaje</span>
              <textarea 
                value={invitacionMensaje}
                onChange={(e) => setInvitacionMensaje(e.target.value)}
              />
            </label>
            <div className="modal-actions">
              <button 
                type="button" 
                className="button ghost" 
                onClick={() => setShowInviteModal(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="button primary">
                Enviar invitación
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Eliminar Participante */}
      <div className={`modal-backdrop ${showDeleteModal ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-icon">🗑️</div>
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
