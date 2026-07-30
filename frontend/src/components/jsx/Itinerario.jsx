import { useState, useEffect, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import TripHeader from './TripHeader';
import ConfirmModal from './ConfirmModal';
import SuccessModal from './SuccessModal';
import api from '../../service/api';
import { AuthContext } from '../../context/AuthContext';
import '../css/styles.css';

export default function Itinerario() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const esViajeAgencia = window.location.pathname.includes('/viajes-agencia');

  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actividadAEliminar, setActividadAEliminar] = useState(null);
  
  const [successModalConfig, setSuccessModalConfig] = useState({ isOpen: false, title: '', message: '' });

  const [nuevaTitulo, setNuevaTitulo] = useState('');
  const [nuevaHorario, setNuevaHorario] = useState('');
  const [nuevaLugar, setNuevaLugar] = useState('');
  const [nuevaResponsable, setNuevaResponsable] = useState('');
  const [nuevaCosto, setNuevaCosto] = useState('');
  const [actividadAEditar, setActividadAEditar] = useState(null);
  
  
  const [participantes, setParticipantes] = useState([]);
  const [viajeDates, setViajeDates] = useState({ inicio: null, fin: null });
  const [viajeOrgId, setViajeOrgId] = useState(null);
  const [errors, setErrors] = useState({});

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
      let orgId = null;
      let orgNombre = '';
      if (resViaje.data) {
        setViajeDates({ inicio: resViaje.data.fechaInicio, fin: resViaje.data.fechaFin });
        setViajeOrgId(resViaje.data.organizadorId);
        orgId = resViaje.data.organizadorId;
        orgNombre = resViaje.data.organizadorNombre;
      }

      const resAct = await api.get(`/actividades/viaje/${id}`);
      if (resAct.data) {
        setActividades(resAct.data.map(a => {
          const isRealizado = a.estado === 'REALIZADO';
          let tipoClass = isRealizado ? 'status finished' : 'status planning';

          const dt = a.horario ? new Date(a.horario) : new Date();
          const horaStr = dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
          const fechaGrupoStr = dt.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

          return {
            id: a.id,
            fechaGrupo: fechaGrupoStr.charAt(0).toUpperCase() + fechaGrupoStr.slice(1),
            hora: horaStr,
            rawHorario: a.horario, // Formato original YYYY-MM-DDTHH:mm
            tipo: a.estado || 'PENDIENTE',
            tipoClass: tipoClass,
            titulo: a.descripcion || 'Nueva Actividad',
            lugar: a.lugar || 'Ubicación',
            responsable: a.nombreResponsable || null,
            responsableId: a.responsableId || null,
            costo: a.costoEstimado || null
          };
        }));
      }
      
      const resPart = await api.get(`/participantes/viaje/${id}`);
      let partList = [];
      if (resPart.data) {
        partList = resPart.data.map(p => ({
          id: p.usuarioId || p.id,
          nombre: p.nombreUsuario || 'Participante'
        }));
      }

      if (orgId && !partList.some(p => p.id === orgId)) {
        partList.unshift({ id: orgId, nombre: orgNombre + ' (Organizador)' });
      }

      setParticipantes(partList);
      if (partList.length > 0) {
        setNuevaResponsable(partList[0].id);
      }
    } catch (err) {
      console.error("Error cargando actividades", err);
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

  const handleConfirmarEliminar = async () => {
    if (!actividadAEliminar) return;
    setIsDeleting(true);
    try {
      await api.delete(`/actividades/${actividadAEliminar.id}`);
      await fetchDatos();
      setSuccessModalConfig({
        isOpen: true,
        title: 'Actividad eliminada',
        message: 'La actividad ha sido eliminada exitosamente del itinerario.'
      });
    } catch (err) {
      console.error("Error eliminando actividad", err);
      showToast('Error al eliminar la actividad');
    } finally {
      setIsDeleting(false);
      setActividadAEliminar(null);
    }
  };

  const handleCrearActividad = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!nuevaTitulo.trim()) newErrors.titulo = 'El título es obligatorio.';
    if (!nuevaLugar.trim()) newErrors.lugar = 'El lugar es obligatorio.';
    if (!nuevaHorario) newErrors.horario = 'El horario es obligatorio.';
    else {
      if (viajeDates.inicio && viajeDates.fin) {
        const dateAct = new Date(nuevaHorario);
        const dateIni = new Date(viajeDates.inicio + 'T00:00:00');
        const dateFin = new Date(viajeDates.fin + 'T23:59:59');
        if (dateAct < dateIni || dateAct > dateFin) {
          newErrors.horario = `Debe estar entre ${viajeDates.inicio} y ${viajeDates.fin}.`;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const payload = {
        viajeId: parseInt(id, 10),
        lugar: nuevaLugar,
        horario: nuevaHorario,
        descripcion: nuevaTitulo,
        responsableId: parseInt(nuevaResponsable, 10),
        costoEstimado: nuevaCosto ? parseFloat(nuevaCosto) : null,
        estado: actividadAEditar ? actividadAEditar.tipo : 'PENDIENTE'
      };

      if (actividadAEditar) {
        await api.put(`/actividades/${actividadAEditar.id}`, payload);
        cerrarModal();
        setSuccessModalConfig({
          isOpen: true,
          title: '¡Cambios guardados!',
          message: 'La actividad se ha editado exitosamente en tu itinerario.'
        });
      } else {
        await api.post('/actividades', payload);
        cerrarModal();
        setSuccessModalConfig({
          isOpen: true,
          title: '¡Actividad creada!',
          message: 'La actividad se ha guardado exitosamente en tu itinerario.'
        });
      }
      
      await fetchDatos();
    } catch (err) {
      console.error("Error guardando actividad", err);
      showToast('Error al guardar actividad');
    }
  };

  const handleMarcarRealizado = async (act) => {
    try {
      await api.put(`/actividades/${act.id}`, {
        viajeId: parseInt(id, 10),
        lugar: act.lugar,
        horario: act.rawHorario,
        descripcion: act.titulo,
        responsableId: parseInt(act.responsableId, 10),
        costoEstimado: act.costo ? parseFloat(act.costo) : null,
        estado: 'REALIZADO'
      });
      await fetchDatos();
      showToast('Actividad marcada como realizada');
    } catch (err) {
      console.error("Error al actualizar estado", err);
      showToast('Error al actualizar estado');
    }
  };

  const abrirModalCrear = () => {
    setActividadAEditar(null);
    setNuevaTitulo('');
    setNuevaLugar('');
    setNuevaHorario('');
    setNuevaCosto('');
    if (participantes.length > 0) {
      setNuevaResponsable(user?.id !== viajeOrgId ? user?.id : participantes[0].id);
    }
    setErrors({});
    setShowCreateModal(true);
  };

  const abrirModalEditar = (act) => {
    setActividadAEditar(act);
    setNuevaTitulo(act.titulo);
    setNuevaLugar(act.lugar);
    setNuevaHorario(act.rawHorario);
    setNuevaCosto(act.costo || '');
    setNuevaResponsable(act.responsableId || (participantes.length > 0 ? participantes[0].id : ''));
    if (user?.id !== viajeOrgId) {
      setNuevaResponsable(user?.id);
    }
    setErrors({});
    setShowCreateModal(true);
  };

  const cerrarModal = () => {
    setShowCreateModal(false);
    setActividadAEditar(null);
  };

  // Agrupar actividades por fechaGrupo
  const actividadesAgrupadas = actividades.reduce((acc, act) => {
    const grupo = act.fechaGrupo || 'General';
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(act);
    return acc;
  }, {});





  //-------------------------------------------
  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <TripHeader id={id} currentTab="itinerario" />
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6B7280' }}>
              Cargando itinerario...
            </div>
          ) : (
            <>
              {/* Content Card */}
              <section className="content-card">
                <div className="section-title">
                  <div>
                    <h2>Itinerario</h2>
                    <p className="muted small">Actividades organizadas por día.</p>
                  </div>
                  {!esViajeAgencia && (
                    <button 
                      className="button primary"
                      onClick={abrirModalCrear}
                    >
                      ＋ Agregar actividad
                    </button>
                  )}
                </div>

                <div className="timeline">
                  {actividades.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6B7280' }}>
                      <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
                      Aún no hay actividades registradas en este itinerario.
                    </div>
                  ) : (
                    Object.keys(actividadesAgrupadas).map((fechaGrupo) => (
                      <section key={fechaGrupo} className="timeline-day">
                        <h3>{fechaGrupo}</h3>
                        <div className="timeline-items">
                          {actividadesAgrupadas[fechaGrupo].map((act) => (
                            <article key={act.id} className="card timeline-card">
                              <div className="time-box">{act.hora}</div>
                              <div style={{ flex: 1 }}>
                                <span className={act.tipoClass}>{act.tipo}</span>
                                <h3>{act.titulo}</h3>
                                <p className="muted small">
                                  {act.lugar}
                                  {act.responsable ? ` · Responsable: ${act.responsable}` : ''}
                                  {act.costo ? ` · Costo estimado: $${act.costo.toLocaleString('es-MX')}` : ''}
                                </p>
                                </div>
                                {!esViajeAgencia && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                    {(user?.id === viajeOrgId || user?.id === act.responsableId) && (
                                      <>
                                        {act.tipo !== 'REALIZADO' && new Date() > new Date(act.rawHorario) && (
                                          <button 
                                            className="button success small"
                                            onClick={() => handleMarcarRealizado(act)}
                                          >
                                            Realizado
                                          </button>
                                        )}
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                          <button 
                                            className="button ghost small"
                                            onClick={() => abrirModalEditar(act)}
                                          >
                                            Editar
                                          </button>
                                          <button 
                                            className="button danger small"
                                            onClick={() => setActividadAEliminar(act)}
                                          >
                                            Eliminar
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}
                              </article>
                          ))}
                        </div>
                      </section>
                    ))
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <ConfirmModal 
        isOpen={!!actividadAEliminar}
        title="Eliminar actividad"
        message="La actividad desaparecerá del itinerario de todos los participantes de forma permanente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmarEliminar}
        onCancel={() => setActividadAEliminar(null)}
        isLoading={isDeleting}
      />

      <SuccessModal 
        isOpen={successModalConfig.isOpen}
        title={successModalConfig.title}
        message={successModalConfig.message}
        onAccept={() => setSuccessModalConfig({ isOpen: false, title: '', message: '' })}
      />

      {/* Modal Agregar Actividad */}
      <div className={`modal-backdrop ${showCreateModal ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-icon">{actividadAEditar ? '✏️' : '📅'}</div>
          <h3>{actividadAEditar ? 'Editar actividad' : 'Agregar actividad'}</h3>
          <form onSubmit={handleCrearActividad}>
            <label className="field">
              <span>Título de la actividad</span>
              <input 
                type="text" 
                placeholder="Ej. Visita al museo, Cena grupal" 
                value={nuevaTitulo}
                onChange={(e) => setNuevaTitulo(e.target.value)}
              />
              {errors.titulo && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.titulo}</span>}
            </label>
            <div className="form-grid">
              <label className="field" style={{ gridColumn: 'span 2' }}>
                <span>Horario de la actividad</span>
                <input 
                  type="datetime-local" 
                  value={nuevaHorario}
                  min={viajeDates.inicio ? `${viajeDates.inicio}T00:00` : undefined}
                  max={viajeDates.fin ? `${viajeDates.fin}T23:59` : undefined}
                  onChange={(e) => setNuevaHorario(e.target.value)}
                />
                {errors.horario && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.horario}</span>}
              </label>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Lugar</span>
                <input 
                type="text" 
                placeholder="Ej. Cancún, Hotel Xcaret"
                value={nuevaLugar}
                onChange={(e) => setNuevaLugar(e.target.value)}
              />
              {errors.lugar && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.lugar}</span>}
              </label>
              <label className="field">
                <span>Responsable</span>
                <select 
                  value={nuevaResponsable} 
                  onChange={(e) => setNuevaResponsable(e.target.value)}
                  disabled={user?.id !== viajeOrgId}
                >
                  {participantes.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                  {participantes.length === 0 && (
                    <option value="">No hay participantes</option>
                  )}
                </select>
                {user?.id !== viajeOrgId && (
                  <span style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                   
                  </span>
                )}
              </label>
            </div>
            <div className="form-grid">
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
                onClick={cerrarModal}
              >
                Cancelar
              </button>
              <button type="submit" className="button primary">
                {actividadAEditar ? 'Guardar cambios' : 'Guardar actividad'}
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
