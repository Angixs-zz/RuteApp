import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

export default function ViajesAgencia() {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS');
  
  const fetchViajes = useCallback(async () => {
    try {
      setLoading(true);
      setErrorCarga('');
      
      const response = await api.get('/viajes/publicos');

      if (Array.isArray(response.data)) {
        setViajes(response.data);
      }
    } catch (err) {
      console.error("Error al cargar viajes de agencia:", err);
      setViajes([]);
      setErrorCarga('No fue posible cargar los viajes de agencia. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [fetchViajes]);

  const handleBuscarSubmit = (e) => {
    e.preventDefault();
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setEstadoFiltro('TODOS');
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
              <span className="eyebrow">DESCUBRE NUEVAS EXPERIENCIAS</span>
              <h1>Viajes de Agencia</h1>
              <p className="muted">Explora los viajes y paquetes públicos creados por nuestras agencias afiliadas.</p>
            </div>
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
              Cargando viajes...
            </div>
          ) : errorCarga ? (
            <div className="banner warn">
              <div>
                <strong>Error al cargar</strong>
                <span>{errorCarga}</span>
              </div>
            </div>
          ) : viajesFiltrados.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <h3>No hay viajes públicos disponibles</h3>
              <p className="muted">Prueba buscando con otros filtros o regresa más tarde.</p>
            </div>
          ) : (
            <section className="list-card">
              {viajesFiltrados.map((viaje) => {
                const estadoReal = calcularEstadoVisual(viaje.fechaInicio, viaje.fechaFin, viaje.estado);
                const est = formatearEstado(estadoReal);
                
                const fechaCorta = viaje.fechaInicio 
                  ? new Date(viaje.fechaInicio + 'T12:00:00').toLocaleDateString('es-MX', {day: 'numeric', month: 'short'})
                  : '--';

                return (
                  <article key={viaje.id} className="trip-row">
                    <div className="row-thumb" style={{ background: viaje.gradiente || 'linear-gradient(135deg, #0E7C7B, #17BEBB)' }}></div>
                    <div className="row-main">
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span className={est.className}>{est.label}</span>
                        <span className="status planning">Agencia</span>
                      </div>
                      <h3>{viaje.nombre}</h3>
                      <p>{viaje.destino} · {formatearFechas(viaje.fechaInicio, viaje.fechaFin)}</p>
                    </div>
                    <div className="metric" style={{ flex: '2' }}>
                       <strong>{viaje.organizadorNombre || 'Agencia'}</strong>
                       <span>Organizador</span>
                    </div>
                    <div className="metric">
                      <strong>${(viaje.presupuestoEstimado || 0).toLocaleString('es-MX')}</strong>
                      <span>Presupuesto</span>
                    </div>
                    <div className="metric">
                      <strong>{fechaCorta}</strong>
                      <span>Salida</span>
                    </div>
                    <Link className="button ghost small" to={`/viajes-agencia/${viaje.id}`}>
                      Ver detalle
                    </Link>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
