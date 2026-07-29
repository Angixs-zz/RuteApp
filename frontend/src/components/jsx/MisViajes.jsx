import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

export default function MisViajes() {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const fetchViajes = useCallback(async () => {
    try {
      setLoading(true);
      setErrorCarga('');
      
      const response = await api.get('/viajes', {
        params: {
          page: paginaActual,
          size: 6,
          busqueda: busqueda || undefined
        }
      });

      if (response.data && response.data.contenido) {
        setViajes(response.data.contenido);
        setTotalPaginas(response.data.totalPaginas || 1);
      } else if (Array.isArray(response.data)) {
        setViajes(response.data);
      }
    } catch (err) {
      console.error("Error al cargar viajes:", err);
      setViajes([]);
      setTotalPaginas(1);
      setErrorCarga('No fue posible cargar tus viajes. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [paginaActual, busqueda]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        fetchViajes();
      }
    });
    return () => {
      active = false;
    };
  }, [fetchViajes, estadoFiltro]);

  const handleBuscarSubmit = (e) => {
    e.preventDefault();
    setPaginaActual(0);
    fetchViajes();
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setEstadoFiltro('TODOS');
    setPaginaActual(0);
  };

  const calcularEstadoVisual = (inicio, fin, estadoDb) => {
    if (estadoDb === 'CANCELADO') return 'CANCELADO';
    if (!inicio || !fin) return 'PLANIFICACION';
    const hoy = new Date().toISOString().split('T')[0];
    if (hoy < inicio) return 'PLANIFICACION';
    if (hoy > fin) return 'FINALIZADO';
    return 'EN_CURSO';
  };

  const formatearEstado = (estado) => {
    switch (estado) {
      case 'PLANIFICACION':
        return { label: 'En Planeación', className: 'status planning' };
      case 'EN_CURSO':
        return { label: 'Confirmado / En Curso', className: 'status confirmed' };
      case 'FINALIZADO':
        return { label: 'Finalizado', className: 'status finished' };
      case 'CANCELADO':
        return { label: 'Cancelado', className: 'status danger' };
      default:
        return { label: estado || 'En Planeación', className: 'status planning' };
    }
  };

  const formatearFechas = (inicio, fin) => {
    if (!inicio || !fin) return 'Fechas por definir';
    const fIni = new Date(inicio);
    const fFin = new Date(fin);
    const opciones = { day: 'numeric', month: 'short' };
    return `${fIni.toLocaleDateString('es-MX', opciones)} – ${fFin.toLocaleDateString('es-MX', opciones)}`;
  };

  const viajesFiltrados = viajes.filter(v => {
    const estadoReal = calcularEstadoVisual(v.fechaInicio, v.fechaFin, v.estado);
    if (estadoFiltro !== 'TODOS' && estadoReal !== estadoFiltro) return false;
    if (busqueda.trim() !== '') {
      const q = busqueda.toLowerCase();
      const matchNombre = v.nombre?.toLowerCase().includes(q);
      const matchDestino = v.destino?.toLowerCase().includes(q);
      return matchNombre || matchDestino;
    }
    return true;
  });

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="eyebrow">ORGANIZA TUS AVENTURAS</span>
              <h1>Mis viajes</h1>
              <p className="muted">Consulta y administra todos tus viajes.</p>
            </div>
            <Link className="button primary" to="/crear-viaje">
              ＋ Crear nuevo viaje
            </Link>
          </div>

          {/* Barra de Filtros */}
          <form className="filters" onSubmit={handleBuscarSubmit}>
            <input 
              type="text"
              placeholder="Buscar por nombre o destino" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <select 
              value={estadoFiltro} 
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PLANIFICACION">Planeación</option>
              <option value="EN_CURSO">Confirmado / En Curso</option>
              <option value="FINALIZADO">Finalizado</option>
            </select>
            <button type="button" className="button ghost" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </form>

          {/* Listado de Viajes */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6B7280' }}>
              Cargando tus viajes...
            </div>
          ) : errorCarga ? (
            <div className="banner warn">
              <div>
                <strong>No se pudieron consultar tus viajes</strong>
                <span>{errorCarga}</span>
              </div>
            </div>
          ) : viajesFiltrados.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <h3>No se encontraron viajes</h3>
              <p className="muted">Intenta ajustando los filtros o crea tu primer viaje.</p>
              <Link className="button primary" to="/crear-viaje" style={{ marginTop: '1rem', display: 'inline-block' }}>
                ＋ Crear nuevo viaje
              </Link>
            </div>
          ) : (
            <section className="list-card">
              {viajesFiltrados.map((viaje) => {
                const estadoReal = calcularEstadoVisual(viaje.fechaInicio, viaje.fechaFin, viaje.estado);
                const est = formatearEstado(estadoReal);
                
                // Formatear solo el día y mes de inicio para el recuadro
                const fechaCorta = viaje.fechaInicio 
                  ? new Date(viaje.fechaInicio + 'T12:00:00').toLocaleDateString('es-MX', {day: 'numeric', month: 'short'})
                  : '--';

                return (
                  <article key={viaje.id} className="trip-row">
                    <div className="row-thumb" style={{ background: viaje.gradiente || 'linear-gradient(135deg, #0E7C7B, #17BEBB)' }}></div>
                    <div className="row-main">
                      <span className={est.className}>{est.label}</span>
                      <h3>{viaje.nombre}</h3>
                      <p>{viaje.destino} · {formatearFechas(viaje.fechaInicio, viaje.fechaFin)}</p>
                    </div>
                    <div className="metric">
                      <strong>{viaje.participantesCount || 1}</strong>
                      <span>Participantes</span>
                    </div>
                    <div className="metric">
                      <strong>${(viaje.presupuestoEstimado || 0).toLocaleString('es-MX')}</strong>
                      <span>Presupuesto</span>
                    </div>
                    <div className="metric">
                      <strong>{fechaCorta}</strong>
                      <span>Salida</span>
                    </div>
                    <Link className="button ghost small" to={`/viajes/${viaje.id}`}>
                      Ver detalle
                    </Link>
                  </article>
                );
              })}
            </section>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="pagination">
              <button 
                disabled={paginaActual === 0}
                onClick={() => setPaginaActual(p => Math.max(0, p - 1))}
              >
                ‹
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                  key={i}
                  className={paginaActual === i ? 'active' : ''}
                  onClick={() => setPaginaActual(i)}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={paginaActual >= totalPaginas - 1}
                onClick={() => setPaginaActual(p => Math.min(totalPaginas - 1, p + 1))}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
