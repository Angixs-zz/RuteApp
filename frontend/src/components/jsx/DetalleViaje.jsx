import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import TripHeader from './TripHeader';
import api from '../../service/api';
import '../css/styles.css';

export default function DetalleViaje() {
  const { id } = useParams();
  
  const [viaje, setViaje] = useState({
    id: id || 1,
    nombre: 'Escapada a Cancún',
    descripcion: 'Viaje grupal para descansar, conocer Isla Mujeres y disfrutar de las principales actividades de Cancún.',
    origen: 'Ciudad de México',
    destino: 'Quintana Roo, México',
    fechaInicio: '2026-08-12',
    fechaFin: '2026-08-16',
    presupuestoEstimado: 12500,
    transporte: 'Avión',
    estado: 'EN_CURSO',
    organizadorId: 1,
    organizadorNombre: 'Miguel Ángel',
    participantesCount: 5,
    porcentajePlaneado: 68
  });

  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const fetchDetalleViaje = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await api.get(`/viajes/${id}`);
      if (response.data) {
        const data = response.data;
        let partCount = 5;
        try {
          const resPart = await api.get(`/participantes/viaje/${id}`);
          if (resPart.data && Array.isArray(resPart.data)) {
            partCount = resPart.data.length;
          }
        } catch {
          // Fallback silencioso en caso de error o sin backend
        }

        setViaje({
          id: data.id,
          nombre: data.nombre,
          descripcion: data.descripcion || 'Viaje grupal para descansar, conocer la zona y disfrutar de las principales actividades.',
          origen: data.origen,
          destino: data.destino,
          fechaInicio: data.fechaInicio,
          fechaFin: data.fechaFin,
          presupuestoEstimado: data.presupuestoEstimado || 0,
          transporte: data.transporte || 'Avión',
          estado: data.estado || 'EN_CURSO',
          organizadorId: data.organizadorId,
          organizadorNombre: data.organizadorNombre || 'Miguel Ángel',
          participantesCount: partCount,
          porcentajePlaneado: data.estado === 'FINALIZADO' ? 100 : 68
        });
      }
    } catch (err) {
      console.error('Error al cargar detalle del viaje:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        fetchDetalleViaje();
      }
    });
    return () => {
      active = false;
    };
  }, [fetchDetalleViaje]);

  const handleCancelarViaje = async () => {
    try {
      if (id && viaje) {
        await api.put(`/viajes/${id}`, {
          nombre: viaje.nombre,
          descripcion: viaje.descripcion,
          origen: viaje.origen || 'Ciudad de México',
          destino: viaje.destino,
          fechaInicio: viaje.fechaInicio,
          fechaFin: viaje.fechaFin,
          presupuestoEstimado: viaje.presupuestoEstimado,
          transporte: viaje.transporte,
          estado: 'CANCELADO',
          organizadorId: viaje.organizadorId || 1
        });
      }
    } catch (err) {
      console.error('Error al actualizar estado a cancelado en backend:', err);
    }
    setViaje(prev => ({ ...prev, estado: 'CANCELADO' }));
    setShowCancelModal(false);
    showToast('El viaje fue cancelado');
  };

  const formatearEstado = (estado) => {
    switch (estado) {
      case 'PLANIFICACION':
        return { label: 'Planeación', className: 'status planning' };
      case 'EN_CURSO':
        return { label: 'Confirmado', className: 'status confirmed' };
      case 'FINALIZADO':
        return { label: 'Finalizado', className: 'status finished' };
      case 'CANCELADO':
        return { label: 'Cancelado', className: 'status cancelled' };
      default:
        return { label: 'Confirmado', className: 'status confirmed' };
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

  const estadoBadge = formatearEstado(viaje.estado);

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6B7280' }}>
              Cargando detalle del viaje...
            </div>
          ) : (
            <>
              <TripHeader id={viaje.id} currentTab="resumen" />

              {/* Main Content Card */}
              <section className="content-card">
                <div className="detail-grid">
                  <div>
                    <div className="section-title">
                      <h2>Resumen del viaje</h2>
                      <Link className="button ghost small" to="/crear-viaje">
                        Editar información
                      </Link>
                    </div>
                    <p className="muted">
                      {viaje.descripcion || 'Viaje grupal para descansar, conocer la zona y disfrutar de las principales actividades.'}
                    </p>
                    
                    <div className="info-grid">
                      <div className="info-item">
                        <span>Organizador</span>
                        <strong>{viaje.organizadorNombre || 'Miguel Ángel'}</strong>
                      </div>
                      <div className="info-item">
                        <span>Participantes</span>
                        <strong>{viaje.participantesCount} confirmados</strong>
                      </div>
                      <div className="info-item">
                        <span>Presupuesto</span>
                        <strong>${(viaje.presupuestoEstimado || 0).toLocaleString('es-MX')} MXN</strong>
                      </div>
                      <div className="info-item">
                        <span>Transporte</span>
                        <strong>{viaje.transporte || 'Avión'}</strong>
                      </div>
                    </div>
                  </div>

                  <aside>
                    <article className="card panel">
                      <span className="eyebrow">PROGRESO DEL VIAJE</span>
                      <h3>{viaje.porcentajePlaneado || 68}% planeado</h3>
                      <div className="progress">
                        <span style={{ width: `${viaje.porcentajePlaneado || 68}%` }}></span>
                      </div>
                      <ul className="activity-list">
                        <li><span>✓</span><span>Fechas y destino</span></li>
                        <li><span>✓</span><span>Participantes</span></li>
                        <li><span>•</span><span>Itinerario</span></li>
                        <li><span>•</span><span>Gastos</span></li>
                      </ul>
                    </article>
                  </aside>
                </div>
              </section>
            </>
          )}
        </div>
      </main>


      {/* Toast Notification */}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </>
  );
}
