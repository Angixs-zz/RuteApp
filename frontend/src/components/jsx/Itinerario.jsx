import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../css/styles.css'; 
import Navbar from './Navbar';
import ConfirmModal from './ConfirmModal';
import TripHeader from './TripHeader';
import api from '../../service/api';

export default function Itinerario() {
  const { id } = useParams();
  const [actividadAEliminar, setActividadAEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const cachedActividades = sessionStorage.getItem(`actividades_${id}`);
  const [actividades, setActividades] = useState(cachedActividades ? JSON.parse(cachedActividades) : []);
  const [loading, setLoading] = useState(!cachedActividades);
  const [isUpdating, setIsUpdating] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const fetchActividades = async () => {
      setIsUpdating(true);
      try {
        const res = await api.get(`/actividades/viaje/${id}`, { timeout: 1500 });
        const newActividades = res.data || [];
        setActividades(newActividades);
        sessionStorage.setItem(`actividades_${id}`, JSON.stringify(newActividades));
      } catch (err) {
        console.error("Error cargando actividades", err);
        setFetchError(true);
      } finally {
        setLoading(false);
        setIsUpdating(false);
      }
    };
    if (id) fetchActividades();
  }, [id]);

  const handleDeleteActivity = async () => {
    if (!actividadAEliminar) return;
    
    setIsDeleting(true);
    const idToDelete = actividadAEliminar;

    try {
      await api.delete(`/actividades/${idToDelete}`);
      
      const nuevasActividades = actividades.filter(a => Number(a.id) !== Number(idToDelete));
      setActividades(nuevasActividades);
      sessionStorage.setItem(`actividades_${id}`, JSON.stringify(nuevasActividades));
    } catch (err) {
      console.error("Error al eliminar actividad:", err);
      alert("No se pudo eliminar la actividad en el servidor.");
    } finally {
      setIsDeleting(false);
      setActividadAEliminar(null);
    }
  };

  const formatearHora = (fechaString) => {
    if (!fechaString) return '--:--';
    const date = new Date(fechaString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatearDia = (fechaString) => {
    if (!fechaString) return '';
    const date = new Date(fechaString);
    return date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const actividadesPorDia = actividades.reduce((acc, actividad) => {
    const dia = formatearDia(actividad.horario);
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(actividad);
    return acc;
  }, {});

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="container">
          
          <TripHeader id={id} currentTab="itinerario" />

          <section className="content-card">
            <div className="section-title">
              <div>
                <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Cronograma de actividades
                  {isUpdating && <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#FEF3C7', color: '#92400E', borderRadius: '12px', fontWeight: 'bold' }}>Actualizando...</span>}
                </h2>
                <p className="muted small">Organiza día por día todo lo que harán en el viaje.</p>
              </div>
              <Link className="button primary" to={`/viajes/${id}/crear-actividad`}>＋ Agregar actividad</Link>
            </div>
            
            <div className="timeline">
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Cargando itinerario...</div>
              ) : fetchError ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>
                  ⚠️ No se pudo conectar con el servidor. Revisa si el backend está encendido.
                </div>
              ) : actividades.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Aún no hay actividades planificadas.</div>
              ) : (
                Object.keys(actividadesPorDia).map((dia) => (
                  <section className="timeline-day" key={dia}>
                    <h3 style={{ textTransform: 'capitalize' }}>{dia}</h3>
                    <div className="timeline-items">
                      {actividadesPorDia[dia].map(act => (
                        <article className="card timeline-card" key={act.id}>
                          <div className="time-box">{formatearHora(act.horario)}</div>
                          <div>
                            <span className={`status ${act.estado === 'CONFIRMADA' ? 'confirmed' : 'planning'}`}>
                              {act.estado || 'Planificación'}
                            </span>
                            <h3>{act.lugar}</h3>
                            <p className="muted small">
                              {act.descripcion || 'Sin descripción'} · Responsable: {act.responsable?.nombre || '-'}
                            </p>
                          </div>
                          <button className="button danger small" onClick={() => setActividadAEliminar(act.id)}>Eliminar</button>
                        </article>
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          </section>

          <ConfirmModal 
            isOpen={!!actividadAEliminar}
            title="Eliminar actividad"
            message="¿Estás seguro de que deseas eliminar esta actividad del itinerario?"
            confirmText="Eliminar"
            cancelText="Cancelar"
            onConfirm={handleDeleteActivity}
            onCancel={() => setActividadAEliminar(null)}
            isLoading={isDeleting}
          />

        </div>
      </main>
      <div className="toast"></div>
    </>
  );
}
