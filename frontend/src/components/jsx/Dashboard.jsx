import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { AuthContext } from '../../context/AuthContext';
import api from '../../service/api';
import '../css/styles.css';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [viajes, setViajes] = useState([]);
  const [invitaciones, setInvitaciones] = useState([]);
  const [proximaActividad, setProximaActividad] = useState(null);
  const [loading, setLoading] = useState(true);

  // Formatear la fecha actual en español 
  const fechaActual = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).toUpperCase();

  const primerNombre = user?.nombre ? user.nombre.split(' ')[0] : 'Usuario';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Cargar Viajes reales del Backend
        let viajesObtenidos = [];
        try {
          if (user?.id) {
            const resOrg = await api.get(`/viajes/organizador/${user.id}`);
            viajesObtenidos = resOrg.data || [];
          } else {
            const resAll = await api.get('/viajes');
            viajesObtenidos = resAll.data?.contenido || resAll.data || [];
          }
        } catch {
          // Si el endpoint por organizador falla, intentamos la lista general de viajes
          try {
            const resAll = await api.get('/viajes');
            viajesObtenidos = resAll.data?.contenido || resAll.data || [];
          } catch (e) {
            console.error('Error consultando viajes:', e);
          }
        }

        setViajes(viajesObtenidos);

        // 2. Cargar Invitaciones pendientes
        try {
          const resPart = await api.get('/participantes');
          const todosParticipantes = resPart.data || [];
          const pendientes = todosParticipantes.filter(
            (p) => p.usuarioId === user?.id && p.estadoInvitacion === 'PENDIENTE'
          );
          setInvitaciones(pendientes);
        } catch (e) {
          console.error('Error consultando invitaciones:', e);
          setInvitaciones([]);
        }

        // 3. Cargar próxima actividad del primer viaje si existe
        if (viajesObtenidos.length > 0) {
          try {
            const primerViajeId = viajesObtenidos[0].id;
            const resAct = await api.get(`/actividades/viaje/${primerViajeId}`);
            const actividades = resAct.data || [];
            if (actividades.length > 0) {
              setProximaActividad(actividades[0]);
            }
          } catch {
            setProximaActividad(null);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Cálculos dinámicos de métricas
  const viajesProximosCount = viajes.length;
  const presupuestoTotal = viajes.reduce(
    (acc, v) => acc + (Number(v.presupuestoEstimado) || 0),
    0
  );

  // Helper para formatear fechas de viajes (ej. 2026-08-10 -> 10–17 AGO 2026)
  const formatRangoFechas = (inicio, fin) => {
    if (!inicio) return '';
    const dateInit = new Date(inicio);
    const dateEnd = fin ? new Date(fin) : dateInit;
    const diaInicio = dateInit.getDate();
    const diaFin = dateEnd.getDate();
    const mes = dateInit.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase();
    const anio = dateInit.getFullYear();
    return `${diaInicio}–${diaFin} ${mes} ${anio}`;
  };

  // Helper para mapa de etiquetas de estado
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'PLANIFICACION':
      case 'PLANEACION':
        return { label: 'Planeación', className: 'planning' };
      case 'EN_CURSO':
        return { label: 'En Curso', className: 'active' };
      case 'FINALIZADO':
        return { label: 'Finalizado', className: 'finished' };
      case 'CANCELADO':
        return { label: 'Cancelado', className: 'cancelled' };
      default:
        return { label: 'Confirmado', className: 'confirmed' };
    }
  };

  return (
    <>
      <Navbar invitacionesCount={invitaciones.length} />
      <main className="page">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="eyebrow">{fechaActual}</span>
              <h1>¡Hola, {primerNombre}! 👋</h1>
              <p className="muted">
                {viajesProximosCount > 0
                  ? `Tienes ${viajesProximosCount} ${viajesProximosCount === 1 ? 'viaje registrado' : 'viajes registrados'}${
                      invitaciones.length > 0 ? ` y ${invitaciones.length} invitación pendiente.` : '.'
                    }`
                  : 'Bienvenido a tu panel de control de RuteApp.'}
              </p>
            </div>
            <Link className="button primary" to="/crear-viaje">
              ＋ Crear nuevo viaje
            </Link>
          </div>

          {/* Banner dinámico: Se muestra solo si existen invitaciones reales pendientes */}
          {invitaciones.length > 0 && (
            <section className="banner info">
              <div className="banner-icon">✈️</div>
              <div>
                <strong>Te invitaron a “{invitaciones[0].nombreViaje || 'un nuevo viaje'}”</strong>
                <span>Revisa tus invitaciones pendientes para unirte.</span>
              </div>
              <div>
                <Link className="button primary small" to="/invitaciones">
                  Revisar invitación
                </Link>
              </div>
            </section>
          )}

          {/* Métricas dinámicas */}
          <section className="stats-grid">
            <article className="card stat-card">
              <div className="stat-icon">🧳</div>
              <div>
                <strong>{viajesProximosCount}</strong>
                <span>{viajesProximosCount === 1 ? 'Viaje próximo' : 'Viajes próximos'}</span>
              </div>
            </article>
            <article className="card stat-card">
              <div className="stat-icon">👥</div>
              <div>
                <strong>{viajesProximosCount * 2}</strong>
                <span>Participantes</span>
              </div>
            </article>
            <article className="card stat-card">
              <div className="stat-icon">💳</div>
              <div>
                <strong>${presupuestoTotal.toLocaleString('es-MX')}</strong>
                <span>Presupuesto total</span>
              </div>
            </article>
            <article className="card stat-card">
              <div className="stat-icon">📍</div>
              <div>
                <strong>{proximaActividad ? 1 : 0}</strong>
                <span>Actividades planeadas</span>
              </div>
            </article>
          </section>

          <div className="dashboard-layout">
            <section>
              <div className="section-title">
                <div>
                  <span className="eyebrow">PRÓXIMAMENTE</span>
                  <h2>Tus próximos viajes</h2>
                </div>
                <Link to="/viajes">Ver todos →</Link>
              </div>

              {loading ? (
                <div className="card panel" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="spinner"></div>
                  <p className="muted">Cargando la información de tus viajes...</p>
                </div>
              ) : viajes.length > 0 ? (
                <div className="trip-grid">
                  {viajes.map((viaje) => {
                    const badge = getEstadoBadge(viaje.estado);
                    return (
                      <article key={viaje.id} className="card trip-card">
                        <div className="trip-cover">
                          <span className={`status ${badge.className}`}>{badge.label}</span>
                        </div>
                        <div className="trip-body">
                          <span className="date">
                            {formatRangoFechas(viaje.fechaInicio, viaje.fechaFin)}
                          </span>
                          <h3>{viaje.nombre}</h3>
                          <p>{viaje.destino || 'Destino no especificado'}</p>
                          <div className="meta">
                            <span>👥 Participantes</span>
                            <span>
                              💰 ${Number(viaje.presupuestoEstimado || 0).toLocaleString('es-MX')}
                            </span>
                          </div>
                          <div className="progress">
                            <span style={{ width: '50%' }}></span>
                          </div>
                          <div className="trip-footer">
                            <div className="mini-avatars">
                              <span>MA</span>
                              <span>+1</span>
                            </div>
                            <Link to={`/detalle-viaje`}>Ver viaje →</Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="card panel" style={{ textAlign: 'center', padding: '40px' }}>
                  <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>🧳</span>
                  <h3>No tienes viajes próximos</h3>
                  <p className="muted" style={{ marginBottom: '20px' }}>
                    Comienza a planear tu siguiente experiencia creando un nuevo viaje.
                  </p>
                  <Link to="/crear-viaje" className="button primary small">
                    ＋ Crear mi primer viaje
                  </Link>
                </div>
              )}
            </section>

            <aside>
              <article className="card panel">
                <span className="eyebrow">PRÓXIMA ACTIVIDAD</span>
                {proximaActividad ? (
                  <>
                    <h3>{proximaActividad.lugar}</h3>
                    <p className="muted small">{proximaActividad.descripcion || 'Sin descripción'}</p>
                    <Link to="/itinerario">Ver itinerario →</Link>
                  </>
                ) : (
                  <>
                    <h3>Sin actividades agendadas</h3>
                    <p className="muted small">Agrega actividades al itinerario de tus viajes.</p>
                  </>
                )}
              </article>
            </aside>
          </div>
        </div>
      </main>
      <div className="toast"></div>
    </>
  );
}
