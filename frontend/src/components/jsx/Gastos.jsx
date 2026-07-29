import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import TripHeader from './TripHeader';
import ConfirmModal from './ConfirmModal';
import api from '../../service/api';
import '../css/styles.css';

export default function Gastos() {
  const { id } = useParams();
  const viajeId = id || 1;

  const [viaje, setViaje] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');

  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
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
      if (resGastos.data) {
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
    } catch (err) {
      console.error('Error al cargar gastos:', err);
      setErrorCarga('No se pudo cargar la información del viaje. Es posible que debas reiniciar tu servidor Spring Boot.');
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

  const handleConfirmarEliminarGasto = async () => {
    if (!gastoAEliminar) return;
    setIsDeleting(true);
    try {
      await api.delete(`/gastos/${gastoAEliminar.id}`);
      await fetchDatos();
      showToast('Gasto eliminado');
    } catch (err) {
      console.error("Error eliminando gasto", err);
      showToast('Error al eliminar el gasto');
    } finally {
      setIsDeleting(false);
      setGastoAEliminar(null);
    }
  };

  // Cálculo de totales
  const totalPresupuesto = viaje?.presupuestoEstimado || 0;
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
          <TripHeader id={id} currentTab="gastos" />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6B7280' }}>
              Cargando gastos...
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
                                <button 
                                  className="button danger small"
                                  onClick={() => setGastoAEliminar(g)}
                                >
                                  Eliminar
                                </button>
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

      <ConfirmModal 
        isOpen={!!gastoAEliminar}
        title="Eliminar gasto"
        message="Se eliminarán también las divisiones asociadas a este gasto. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmarEliminarGasto}
        onCancel={() => setGastoAEliminar(null)}
        isLoading={isDeleting}
      />

      {/* Toast Notification */}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </>
  );
}
