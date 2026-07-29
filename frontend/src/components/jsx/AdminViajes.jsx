import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

const estados = {
  PLANIFICACION: ['Planeación', 'planning'],
  PLANEACION: ['Planeación', 'planning'],
  EN_CURSO: ['En curso', 'active'],
  FINALIZADO: ['Finalizado', 'finished'],
  CANCELADO: ['Cancelado', 'cancelled'],
};

const fecha = (valor) => valor ? new Date(`${valor}T00:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Por definir';

export default function AdminViajes() {
  const [viajes, setViajes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');
  const [solicitud, setSolicitud] = useState(0);
  const [estado, setEstado] = useState('TODOS');
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [viajeAEliminar, setViajeAEliminar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    api.get('/viajes', { params: { page: pagina, size: 10, busqueda: busquedaAplicada || undefined, estado: estado === 'TODOS' ? undefined : estado } })
      .then(({ data }) => {
        if (!activo) return;
        setViajes(Array.isArray(data) ? data : data?.contenido ?? []);
        setTotalPaginas(Array.isArray(data) ? 1 : Math.max(data?.totalPaginas ?? 1, 1));
      })
      .catch(() => {
        if (activo) setError('No fue posible cargar los viajes.');
      })
      .finally(() => {
        if (activo) setLoading(false);
      });
    return () => {
      activo = false;
    };
  }, [busquedaAplicada, estado, pagina, solicitud]);

  const buscar = (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setPagina(0);
    setBusquedaAplicada(busqueda.trim());
    setSolicitud((actual) => actual + 1);
  };

  const cambiarPagina = (nuevaPagina) => {
    setLoading(true);
    setError('');
    setPagina(nuevaPagina);
  };

  const eliminarViaje = async () => {
    if (!viajeAEliminar) return;
    try {
      await api.delete(`/viajes/${viajeAEliminar.id}`);
      setViajes((actuales) => actuales.filter((viaje) => viaje.id !== viajeAEliminar.id));
      setViajeAEliminar(null);
    } catch {
      setError('No fue posible eliminar el viaje. Puede tener información relacionada.');
      setViajeAEliminar(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page"><div className="container">
        <div className="page-head"><div><span className="eyebrow">ADMINISTRACIÓN DE VIAJES</span><h1>Todos los viajes</h1><p className="muted">Consulta y elimina viajes registrados en la plataforma.</p></div></div>

        <form className="filters admin-trip-filters" onSubmit={buscar}>
          <input aria-label="Buscar viaje" placeholder="Buscar nombre, destino u organizador" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} />
          <select aria-label="Filtrar por estado" value={estado} onChange={(event) => setEstado(event.target.value)}>
            <option value="TODOS">Todos los estados</option><option value="PLANIFICACION">Planeación</option><option value="EN_CURSO">En curso</option><option value="FINALIZADO">Finalizado</option><option value="CANCELADO">Cancelado</option>
          </select>
          <button className="button ghost" type="submit">Buscar</button>
        </form>
        {error && <p className="banner warn">{error}</p>}
        {loading ? (
          <div className="card panel admin-loading"><div className="spinner"></div><p className="muted">Cargando viajes...</p></div>
        ) : (
          <>
            <div className="table-wrap"><table><thead><tr><th>Viaje</th><th>Organizador</th><th>Fechas</th><th>Presupuesto</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
              {viajes.map((viaje) => {
                const [etiqueta, clase] = estados[viaje.estado] ?? [viaje.estado, 'planning'];
                return <tr key={viaje.id}><td><strong>{viaje.nombre}</strong><br /><span className="muted">{viaje.destino || 'Sin destino'}</span></td><td>{viaje.organizadorNombre || 'Sin organizador'}</td><td>{fecha(viaje.fechaInicio)}<br /><span className="muted">a {fecha(viaje.fechaFin)}</span></td><td>${Number(viaje.presupuestoEstimado || 0).toLocaleString('es-MX')}</td><td><span className={`status ${clase}`}>{etiqueta}</span></td><td><div className="admin-actions"><Link className="button ghost small" to={`/admin/viajes/${viaje.id}`}>Ver</Link><Link className="button ghost small" to={`/admin/viajes/${viaje.id}/editar`}>Editar</Link><button className="button danger small" type="button" onClick={() => setViajeAEliminar(viaje)}>Eliminar</button></div></td></tr>;
              })}
              {viajes.length === 0 && <tr><td colSpan="6" className="admin-empty">No se encontraron viajes.</td></tr>}
            </tbody></table></div>
            {totalPaginas > 1 && <div className="pagination"><button type="button" disabled={pagina === 0} onClick={() => cambiarPagina(pagina - 1)}>‹</button><span className="admin-page-count">Página {pagina + 1} de {totalPaginas}</span><button type="button" disabled={pagina + 1 >= totalPaginas} onClick={() => cambiarPagina(pagina + 1)}>›</button></div>}
          </>
        )}
      </div></main>
      <ConfirmModal isOpen={Boolean(viajeAEliminar)} title="Eliminar viaje" message={`¿Deseas eliminar “${viajeAEliminar?.nombre ?? 'este viaje'}”? Esta acción no se puede deshacer.`} confirmText="Eliminar" onConfirm={eliminarViaje} onCancel={() => setViajeAEliminar(null)} />
    </>
  );
}
