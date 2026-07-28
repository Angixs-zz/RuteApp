import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

export default function Itinerario() {
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

  const [actividades, setActividades] = useState([
    {
      id: 1,
      fechaGrupo: 'Miércoles, 12 de agosto',
      hora: '08:30',
      tipo: 'Transporte',
      tipoClass: 'status active',
      titulo: 'Vuelo Oaxaca–Cancún',
      lugar: 'Aeropuerto Internacional de Oaxaca',
      responsable: 'Miguel',
      costo: null
    },
    {
      id: 2,
      fechaGrupo: 'Miércoles, 12 de agosto',
      hora: '15:00',
      tipo: 'Hospedaje',
      tipoClass: 'status confirmed',
      titulo: 'Registro en el hotel',
      lugar: 'Zona Hotelera',
      responsable: 'Yareli',
      costo: null
    },
    {
      id: 3,
      fechaGrupo: 'Jueves, 13 de agosto',
      hora: '09:00',
      tipo: 'Actividad',
      tipoClass: 'status planning',
      titulo: 'Visita a Isla Mujeres',
      lugar: 'Muelle Cancún',
      responsable: null,
      costo: 1200
    },
    {
      id: 4,
      fechaGrupo: 'Jueves, 13 de agosto',
      hora: '19:30',
      tipo: 'Alimentos',
      tipoClass: 'status planning',
      titulo: 'Cena grupal',
      lugar: 'Restaurante La Habichuela',
      responsable: 'Jorge',
      costo: null
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actividadAEliminar, setActividadAEliminar] = useState(null);

  // Formulario nueva actividad
  const [nuevaTitulo, setNuevaTitulo] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('Miércoles, 12 de agosto');
  const [nuevaHora, setNuevaHora] = useState('10:00');
  const [nuevaTipo, setNuevaTipo] = useState('Actividad');
  const [nuevaLugar, setNuevaLugar] = useState('');
  const [nuevaResponsable, setNuevaResponsable] = useState('');
  const [nuevaCosto, setNuevaCosto] = useState('');

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
      const resAct = await api.get(`/actividades/viaje/${id}`);
      if (resAct.data && Array.isArray(resAct.data) && resAct.data.length > 0) {
        setActividades(resAct.data.map(a => {
          let tipoClass = 'status planning';
          if (a.estado === 'Transporte') tipoClass = 'status active';
          else if (a.estado === 'Hospedaje') tipoClass = 'status confirmed';

          const dt = a.horario ? new Date(a.horario) : new Date();
          const horaStr = dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
          const fechaGrupoStr = dt.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

          return {
            id: a.id,
            fechaGrupo: fechaGrupoStr.charAt(0).toUpperCase() + fechaGrupoStr.slice(1),
            hora: horaStr,
            tipo: a.estado || 'Actividad',
            tipoClass: tipoClass,
            titulo: a.descripcion || 'Nueva Actividad',
            lugar: a.lugar || 'Cancún',
            responsable: a.nombreResponsable || null,
            costo: a.costoEstimado || null
          };
        }));
      }
    } catch {
      // Fallback a los datos iniciales mock
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
      // Fallback
    }
    setViaje(prev => ({ ...prev, estado: 'CANCELADO' }));
    setShowCancelModal(false);
    showToast('El viaje fue cancelado');
  };

  const handleConfirmarEliminar = async () => {
    if (!actividadAEliminar) return;
    try {
      if (id && actividadAEliminar.id) {
        await api.delete(`/actividades/${actividadAEliminar.id}`);
      }
    } catch {
      // Fallback
    }

    setActividades(prev => prev.filter(a => a.id !== actividadAEliminar.id));
    setShowDeleteModal(false);
    setActividadAEliminar(null);
    showToast('Actividad eliminada');
  };

  const handleCrearActividad = async (e) => {
    e.preventDefault();
    if (!nuevaTitulo.trim()) {
      showToast('Por favor escribe un título para la actividad');
      return;
    }

    try {
      if (id) {
        await api.post('/actividades', {
          viajeId: id,
          descripcion: nuevaTitulo,
          lugar: nuevaLugar,
          costoEstimado: nuevaCosto ? parseFloat(nuevaCosto) : null,
          estado: nuevaTipo
        });
      }
    } catch {
      // Fallback
    }

    let tipoClass = 'status planning';
    if (nuevaTipo === 'Transporte') tipoClass = 'status active';
    else if (nuevaTipo === 'Hospedaje') tipoClass = 'status confirmed';

    const nuevaAct = {
      id: Date.now(),
      fechaGrupo: nuevaFecha,
      hora: nuevaHora,
      tipo: nuevaTipo,
      tipoClass: tipoClass,
      titulo: nuevaTitulo,
      lugar: nuevaLugar || 'Cancún',
      responsable: nuevaResponsable || null,
      costo: nuevaCosto ? parseFloat(nuevaCosto) : null
    };

    setActividades(prev => [...prev, nuevaAct]);
    setNuevaTitulo('');
    setNuevaLugar('');
    setNuevaResponsable('');
    setNuevaCosto('');
    setShowCreateModal(false);
    showToast('Actividad agregada al itinerario');
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

  // Agrupar actividades por fechaGrupo
  const actividadesAgrupadas = actividades.reduce((acc, act) => {
    const grupo = act.fechaGrupo || 'General';
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(act);
    return acc;
  }, {});

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6B7280' }}>
              Cargando itinerario...
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
                <Link to={`/viajes/${viajeId}/participantes`}>Participantes</Link>
                <Link className="active" to={`/viajes/${viajeId}/itinerario`}>Itinerario</Link>
                <Link to="/gastos">Gastos</Link>
                <Link to="/notificaciones">Notificaciones</Link>
              </nav>

              {/* Content Card */}
              <section className="content-card">
                <div className="section-title">
                  <div>
                    <h2>Itinerario</h2>
                    <p className="muted small">Actividades organizadas por día.</p>
                  </div>
                  <button 
                    className="button primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    ＋ Agregar actividad
                  </button>
                </div>

                <div className="timeline">
                  {Object.keys(actividadesAgrupadas).map((fechaGrupo) => (
                    <section key={fechaGrupo} className="timeline-day">
                      <h3>{fechaGrupo}</h3>
                      <div className="timeline-items">
                        {actividadesAgrupadas[fechaGrupo].map((act) => (
                          <article key={act.id} className="card timeline-card">
                            <div className="time-box">{act.hora}</div>
                            <div>
                              <span className={act.tipoClass}>{act.tipo}</span>
                              <h3>{act.titulo}</h3>
                              <p className="muted small">
                                {act.lugar}
                                {act.responsable ? ` · Responsable: ${act.responsable}` : ''}
                                {act.costo ? ` · Costo estimado: $${act.costo.toLocaleString('es-MX')}` : ''}
                              </p>
                            </div>
                            {act.titulo === 'Cena grupal' || act.id > 4 ? (
                              <button 
                                className="button danger small"
                                onClick={() => {
                                  setActividadAEliminar(act);
                                  setShowDeleteModal(true);
                                }}
                              >
                                Eliminar
                              </button>
                            ) : (
                              <button 
                                className="button ghost small"
                                onClick={() => showToast(`Editando ${act.titulo}`)}
                              >
                                Editar
                              </button>
                            )}
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
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

      {/* Modal Eliminar Actividad */}
      <div className={`modal-backdrop ${showDeleteModal ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-icon">🗑️</div>
          <h3>Eliminar actividad</h3>
          <p className="muted">
            La actividad desaparece del itinerario de todos los participantes.
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

      {/* Modal Agregar Actividad */}
      <div className={`modal-backdrop ${showCreateModal ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-icon">📅</div>
          <h3>Agregar actividad</h3>
          <form onSubmit={handleCrearActividad}>
            <label className="field">
              <span>Título de la actividad</span>
              <input 
                type="text" 
                placeholder="Ej. Visita al museo, Cena grupal" 
                value={nuevaTitulo}
                onChange={(e) => setNuevaTitulo(e.target.value)}
              />
            </label>
            <div className="form-grid">
              <label className="field">
                <span>Día</span>
                <input 
                  type="text" 
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Hora</span>
                <input 
                  type="text" 
                  placeholder="09:00"
                  value={nuevaHora}
                  onChange={(e) => setNuevaHora(e.target.value)}
                />
              </label>
            </div>
            <div className="form-grid">
              <label className="field">
                <span>Tipo</span>
                <select 
                  value={nuevaTipo} 
                  onChange={(e) => setNuevaTipo(e.target.value)}
                >
                  <option value="Actividad">Actividad</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Hospedaje">Hospedaje</option>
                  <option value="Alimentos">Alimentos</option>
                </select>
              </label>
              <label className="field">
                <span>Lugar</span>
                <input 
                  type="text" 
                  placeholder="Ubicación"
                  value={nuevaLugar}
                  onChange={(e) => setNuevaLugar(e.target.value)}
                />
              </label>
            </div>
            <div className="form-grid">
              <label className="field">
                <span>Responsable (opcional)</span>
                <input 
                  type="text" 
                  placeholder="Nombre"
                  value={nuevaResponsable}
                  onChange={(e) => setNuevaResponsable(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Costo estimado (opcional)</span>
                <input 
                  type="number" 
                  placeholder="0"
                  value={nuevaCosto}
                  onChange={(e) => setNuevaCosto(e.target.value)}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="button ghost" 
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="button primary">
                Guardar actividad
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </>
  );
}
