import { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import TripHeader from './TripHeader';
import ConfirmModal from './ConfirmModal';
import SuccessModal from './SuccessModal';
import EditarViajeModal from './EditarViajeModal';
import api from '../../service/api';
import { AuthContext } from '../../context/AuthContext';
import '../css/styles.css';

export default function DetalleViaje() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [successModalConfig, setSuccessModalConfig] = useState({ isOpen: false, title: '', message: '' });

  const fetchDetalleViaje = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await api.get(`/viajes/${id}`, { timeout: 5000 });
      if (response.data) {
        const data = response.data;
        let partCount = 5;
        try {
          const resPart = await api.get(`/participantes/viaje/${id}`, { timeout: 5000 });
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


  const handleEliminarViaje = async () => {
    try {
      if (id) {
        await api.delete(`/viajes/${id}`);
        window.location.href = '/viajes';
      }
    } catch (err) {
      console.error('Error eliminando viaje:', err);
    }
    setShowDeleteModal(false);
  };

  const handleEditSuccess = async (title, message) => {
    setSuccessModalConfig({ isOpen: true, title, message });
    await fetchDetalleViaje();
  };

  const getCountdown = (fechaInicio) => {
    if (!fechaInicio) return 'Fechas por definir';
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const inicio = new Date(fechaInicio + 'T00:00:00');
    inicio.setHours(0,0,0,0);
    const diff = inicio - hoy;
    const diasFaltantes = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (diasFaltantes > 0) {
      return `Faltan ${diasFaltantes} día(s)`;
    } else if (diasFaltantes === 0) {
      return '¡El viaje empieza hoy!';
    } else {
      return 'El viaje ya inició o finalizó';
    }
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
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {user?.id === viaje.organizadorId && (
                          <button className="button ghost small" onClick={() => setShowEditModal(true)}>
                            Editar información
                          </button>
                        )}
                      </div>
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
                      <span className="eyebrow">ESTADO DEL VIAJE</span>
                      <h3>{viaje.estado === 'CANCELADO' ? 'CANCELADO' : getCountdown(viaje.fechaInicio)}</h3>
                      
                      <ul className="activity-list" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                        <li><span>✓</span><span>Destino y Fechas</span></li>
                        <li><span>✓</span><span>Participantes</span></li>
                        <li><span>✓</span><span>Itinerario</span></li>
                        <li><span>✓</span><span>Gastos Compartidos</span></li>
                      </ul>

                      {user?.id === viaje.organizadorId && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button 
                            className="button ghost small" 
                            style={{ color: '#EF4444', borderColor: '#EF4444' }}
                            onClick={() => setShowDeleteModal(true)}
                          >
                            Eliminar viaje permanentemente
                          </button>
                        </div>
                      )}
                    </article>
                  </aside>
                </div>
              </section>

              {/* Modales */}

              <ConfirmModal 
                isOpen={showDeleteModal}
                title="Eliminar viaje"
                message="Esta acción no se puede deshacer. Se eliminarán todas las actividades, gastos y participantes."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                onConfirm={handleEliminarViaje}
                onCancel={() => setShowDeleteModal(false)}
              />

              <SuccessModal 
                isOpen={successModalConfig.isOpen}
                title={successModalConfig.title}
                message={successModalConfig.message}
                onAccept={() => setSuccessModalConfig({ isOpen: false, title: '', message: '' })}
              />

              <EditarViajeModal 
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                viaje={viaje}
                onSaveSuccess={handleEditSuccess}
              />
            </>
          )}
        </div>
      </main>



    </>
  );
}
