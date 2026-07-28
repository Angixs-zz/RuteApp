import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

export default function Gastos() {
  const { id } = useParams();
  const viajeId = id || 1;

  const [viaje, setViaje] = useState({
    id: viajeId,
    nombre: 'Escapada a Cancún',
    destino: 'Quintana Roo, México',
    fechaInicio: '2026-08-12',
    fechaFin: '2026-08-16',
    presupuestoEstimado: 12500,
    estado: 'EN_CURSO'
  });

  const [gastos, setGastos] = useState([
    {
      id: 1,
      concepto: 'Boletos de avión',
      fecha: '10 ago 2026',
      categoria: 'Transporte',
      monto: 4800,
      pagador: 'Miguel',
      estado: 'Dividido',
      estadoClass: 'status confirmed'
    },
    {
      id: 2,
      concepto: 'Reserva de hotel',
      fecha: '11 ago 2026',
      categoria: 'Hospedaje',
      monto: 2600,
      pagador: 'Yareli',
      estado: 'Pendiente',
      estadoClass: 'status pending'
    },
    {
      id: 3,
      concepto: 'Cena grupal',
      fecha: '13 ago 2026',
      categoria: 'Alimentos',
      monto: 1050,
      pagador: 'Jorge',
      estado: 'Pagado',
      estadoClass: 'status confirmed'
    }
  ]);

  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');

  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gastoAEliminar, setGastoAEliminar] = useState(null);

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
      if (resViaje.data) {
        setViaje(resViaje.data);
      }
      const resGastos = await api.get(`/gastos/viaje/${id}`);
      if (resGastos.data && Array.isArray(resGastos.data) && resGastos.data.length > 0) {
        setGastos(resGastos.data.map(g => ({
          id: g.id,
          concepto: g.concepto,
          fecha: g.fecha ? new Date(g.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '12 ago 2026',
          categoria: g.categoria || 'Otros',
          monto: g.monto ? parseFloat(g.monto) : 0,
          pagador: g.pagadorNombre || 'Miguel',
          estado: 'Dividido',
          estadoClass: 'status confirmed'
        })));
      }
    } catch {
      // Fallback a los datos mock
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

  const handleCancelarViaje = async () => {
    try {
      if (id) {
        await api.put(`/viajes/${id}`, { ...viaje, estado: 'CANCELADO' });
      }
    } catch {
      // Fallback
    }
    setViaje(prev => ({ ...prev, estado: 'CANCELADO' }));
    setShowCancelModal(false);
    showToast('El viaje fue cancelado');
  };

  const handleConfirmarEliminarGasto = async () => {
    if (!gastoAEliminar) return;
    try {
      if (gastoAEliminar.id) {
        await api.delete(`/gastos/${gastoAEliminar.id}`);
      }
    } catch {
      // Fallback
    }

    setGastos(prev => prev.filter(g => g.id !== gastoAEliminar.id));
    setShowDeleteModal(false);
    setGastoAEliminar(null);
    showToast('Gasto eliminado');
  };

  // Cálculo de totales
  const totalPresupuesto = viaje.presupuestoEstimado || 12500;
  const totalGastado = gastos.reduce((sum, g) => sum + g.monto, 0);
  const disponible = totalPresupuesto - totalGastado;

  const gastosFiltrados = gastos.filter(g => {
    if (categoriaFiltro !== 'TODAS' && g.categoria.toUpperCase() !== categoriaFiltro.toUpperCase()) {
      return false;
    }
    if (busqueda.trim() !== '') {
      return g.concepto.toLowerCase().includes(busqueda.toLowerCase()) || g.pagador.toLowerCase().includes(busqueda.toLowerCase());
    }
    return true;
  });

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

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6B7280' }}>
              Cargando gastos...
            </div>
          ) : (
            <>
              {/* Trip Hero Header */}
              <section className="trip-hero">
                <div className="trip-hero-content">
                  <div>
                    <span className={viaje.estado === 'CANCELADO' ? 'status cancelled' : 'status confirmed'}>
                      {viaje.estado === 'CANCELADO' ? 'Cancelado' : 'Confirmado'}
                    </span>
                    <h1>{viaje.nombre}</h1>
                    <p>{viaje.destino} · {formatearFechas(viaje.fechaInicio, viaje.fechaFin)}</p>
                  </div>
                  {viaje.estado !== 'CANCELADO' && (
                    <button 
                      className="button ghost" 
                      onClick={() => setShowCancelModal(true)}
                    >
                      Cancelar viaje
                    </button>
                  )}
                </div>
              </section>

              {/* Tabs Nav */}
              <nav className="tabs">
                <Link to={`/viajes/${viajeId}`}>Resumen</Link>
                <Link to={`/viajes/${viajeId}/participantes`}>Participantes</Link>
                <Link to={`/viajes/${viajeId}/itinerario`}>Itinerario</Link>
                <Link className="active" to={`/viajes/${viajeId}/gastos`}>Gastos</Link>
                <Link to="/notificaciones">Notificaciones</Link>
              </nav>

              {/* Content Card */}
              <section className="content-card">
                <div className="section-title">
                  <div>
                    <h2>Gastos del viaje</h2>
                    <p className="muted small">Consulta el presupuesto y los pagos pendientes.</p>
                  </div>
                  <Link 
                    className="button primary" 
                    to={id ? `/viajes/${id}/registrar-gasto` : '/registrar-gasto'}
                  >
                    ＋ Registrar gasto
                  </Link>
                </div>

                {/* Resumen de Presupuesto */}
                <div className="budget-summary">
                  <article className="card budget-card">
                    <span>Presupuesto total</span>
                    <strong>${totalPresupuesto.toLocaleString('es-MX')}</strong>
                  </article>
                  <article className="card budget-card">
                    <span>Total gastado</span>
                    <strong>${totalGastado.toLocaleString('es-MX')}</strong>
                  </article>
                  <article className="card budget-card">
                    <span>Disponible</span>
                    <strong style={{ color: disponible >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      ${disponible.toLocaleString('es-MX')}
                    </strong>
                  </article>
                </div>

                <div className="expense-layout">
                  <div>
                    {/* Filtros */}
                    <div className="filters" style={{ gridTemplateColumns: '1fr 180px 180px' }}>
                      <input 
                        type="text" 
                        placeholder="Buscar gasto" 
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                      />
                      <select 
                        value={categoriaFiltro}
                        onChange={(e) => setCategoriaFiltro(e.target.value)}
                      >
                        <option value="TODAS">Todas las categorías</option>
                        <option value="TRANSPORTE">Transporte</option>
                        <option value="HOSPEDAJE">Hospedaje</option>
                        <option value="ALIMENTOS">Alimentos</option>
                      </select>
                      <select>
                        <option>Todas las fechas</option>
                      </select>
                    </div>

                    {/* Tabla de Gastos */}
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Concepto</th>
                            <th>Categoría</th>
                            <th>Monto</th>
                            <th>Pagado por</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gastosFiltrados.map((g) => (
                            <tr key={g.id}>
                              <td>
                                <strong>{g.concepto}</strong>
                                <br />
                                <span className="muted">{g.fecha}</span>
                              </td>
                              <td>{g.categoria}</td>
                              <td>${g.monto.toLocaleString('es-MX')}</td>
                              <td>{g.pagador}</td>
                              <td>
                                <span className={g.estadoClass}>{g.estado}</span>
                              </td>
                              <td>
                                {g.concepto === 'Cena grupal' || g.id > 3 ? (
                                  <button 
                                    className="button danger small"
                                    onClick={() => {
                                      setGastoAEliminar(g);
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    Eliminar
                                  </button>
                                ) : (
                                  <button 
                                    className="button ghost small"
                                    onClick={() => showToast(`Detalles de ${g.concepto}`)}
                                  >
                                    Ver
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <aside>
                    <article className="card chart-card">
                      <span className="eyebrow">POR CATEGORÍA</span>
                      <h3>Distribución de gastos</h3>
                      <div className="donut"></div>
                      <div className="legend">
                        <span>Transporte</span>
                        <span>Hospedaje</span>
                        <span>Alimentos</span>
                        <span>Actividades</span>
                      </div>
                    </article>

                    <article className="card panel" style={{ marginTop: '16px' }}>
                      <span className="eyebrow">TU SALDO</span>
                      <h2 style={{ color: 'var(--coral)' }}>$1,240 pendiente</h2>
                      <p className="muted small">Debes a Yareli $720 y a Jorge $520.</p>
                    </article>
                  </aside>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* Modal Cancelar Viaje */}
      <div className={`modal-backdrop ${showCancelModal ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-icon">⚠️</div>
          <h3>¿Cancelar este viaje?</h3>
          <p className="muted">
            Los participantes recibirán una notificación y el viaje cambiará al estado cancelado.
          </p>
          <div className="modal-actions">
            <button className="button ghost" onClick={() => setShowCancelModal(false)}>
              Volver
            </button>
            <button className="button danger" onClick={handleCancelarViaje}>
              Cancelar viaje
            </button>
          </div>
        </div>
      </div>

      {/* Modal Eliminar Gasto */}
      <div className={`modal-backdrop ${showDeleteModal ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-icon">🗑️</div>
          <h3>Eliminar gasto</h3>
          <p className="muted">
            Se eliminarán también las divisiones asociadas.
          </p>
          <div className="modal-actions">
            <button className="button ghost" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </button>
            <button className="button danger" onClick={handleConfirmarEliminarGasto}>
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </>
  );
}
