import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import TripHeader from './TripHeader';
import api from '../../service/api';
import '../css/styles.css';

export default function DetalleViaje() {
  const { id } = useParams();
  
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
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
          descripcion: data.descripcion || 'Sin descripción',
          origen: data.origen || 'No especificado',
          destino: data.destino,
          fechaInicio: data.fechaInicio,
          fechaFin: data.fechaFin,
          presupuestoEstimado: data.presupuestoEstimado || 0,
          transporte: data.transporte || 'No especificado',
          estado: data.estado || 'EN_CURSO',
          organizadorId: data.organizadorId,
          organizadorNombre: data.organizadorNombre || 'Organizador',
          participantesCount: partCount,
          porcentajePlaneado: data.estado === 'FINALIZADO' ? 100 : 68
        });
      }
    } catch (err) {
      console.error('Error al cargar detalle del viaje:', err);
      setErrorCarga('No se pudo cargar la información del viaje. Es posible que debas reiniciar tu servidor Spring Boot para aplicar los cambios de red.');
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
          origen: viaje.origen,
          destino: viaje.destino,
          fechaInicio: viaje.fechaInicio,
          fechaFin: viaje.fechaFin,
          presupuestoEstimado: viaje.presupuestoEstimado,
          transporte: viaje.transporte,
          estado: 'CANCELADO',
          organizadorId: viaje.organizadorId
        });
      }
    } catch (err) {
      console.error('Error al actualizar estado a cancelado en backend:', err);
    }
    setViaje(prev => ({ ...prev, estado: 'CANCELADO' }));
    setShowCancelModal(false);
    showToast('El viaje fue cancelado');
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <TripHeader id={id} currentTab="resumen" />
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6B7280' }}>
              Cargando detalle del viaje...
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
                      {viaje.descripcion || 'Sin descripción'}
                    </p>
                    
                    <div className="info-grid">
                      <div className="info-item">
                        <span>Organizador</span>
                        <strong>{viaje.organizadorNombre}</strong>
                      </div>
                      <div className="info-item">
                        <span>Participantes</span>
                        <strong>{viaje.participantesCount} confirmado(s)</strong>
                      </div>
                      <div className="info-item">
                        <span>Presupuesto por persona</span>
                        <strong>${(viaje.presupuestoEstimado || 0).toLocaleString('es-MX')} MXN</strong>
                      </div>
                      <div className="info-item">
                        <span>Transporte</span>
                        <strong>{viaje.transporte || 'No especificado'}</strong>
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
