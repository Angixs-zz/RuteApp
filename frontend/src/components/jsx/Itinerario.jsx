import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../css/styles.css'; 
import Navbar from './Navbar';
import ConfirmModal from './ConfirmModal';
import TripHeader from './TripHeader';
import api from '../../service/api';

export default function Itinerario() {
  const { id } = useParams();
  const [deleteActivityOpen, setDeleteActivityOpen] = useState(false);
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const res = await api.get(`/actividades/viaje/${id}`, { timeout: 1500 });
        setActividades(res.data || []);
      } catch (err) {
        console.error("Error cargando actividades", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchActividades();
  }, [id]);

  const handleDeleteActivity = () => {
    setDeleteActivityOpen(false);
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

  // Agrupar actividades por día
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
                <h2>Itinerario</h2>
                <p className="muted small">Actividades organizadas por día.</p>
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
                          <button className="button danger small" onClick={() => setDeleteActivityOpen(true)}>Eliminar</button>
                        </article>
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          </section>

          <ConfirmModal 
            isOpen={deleteActivityOpen}
            title="Eliminar actividad"
            message="La actividad desaparecerá del itinerario de todos los participantes."
            confirmText="Eliminar"
            cancelText="Cancelar"
            onConfirm={handleDeleteActivity}
            onCancel={() => setDeleteActivityOpen(false)}
          />

        </div>
      </main>
      <div className="toast"></div>
    </>
  );
}
