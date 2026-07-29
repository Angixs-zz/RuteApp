import { useState, useEffect, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import TripHeader from './TripHeader';
import ConfirmModal from './ConfirmModal';
import SuccessModal from './SuccessModal';
import RegistrarGasto from './RegistrarGasto';
import { Calendar, Edit2 } from 'lucide-react';
import api from '../../service/api';
import { AuthContext } from '../../context/AuthContext';
import '../css/styles.css';

export default function Gastos() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [viaje, setViaje] = useState(null);
  const [viajeDates, setViajeDates] = useState({ inicio: null, fin: null });
  const [viajeOrgId, setViajeOrgId] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');
  const [fechaFiltro, setFechaFiltro] = useState('TODAS');

  const [loading, setLoading] = useState(true);

  // Modales
  const [isDeleting, setIsDeleting] = useState(false);
  const [gastoAEliminar, setGastoAEliminar] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successModalConfig, setSuccessModalConfig] = useState({ isOpen: false, title: '', message: '' });

  // Formulario / Modal
  const [gastoAEditar, setGastoAEditar] = useState(null);

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
      let orgId = null;
      let orgNombre = '';
      if (resViaje.data) {
        setViaje(resViaje.data);
        setViajeDates({ inicio: resViaje.data.fechaInicio, fin: resViaje.data.fechaFin });
        setViajeOrgId(resViaje.data.organizadorId);
        orgId = resViaje.data.organizadorId;
        orgNombre = resViaje.data.organizadorNombre;
      }

      const resGastos = await api.get(`/gastos/viaje/${id}`);
      if (resGastos.data) {
        setGastos(resGastos.data.map(g => ({
          id: g.id,
          concepto: g.concepto,
          rawFecha: g.fecha,
          fecha: g.fecha ? new Date(g.fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
          categoria: g.categoria || 'OTRO',
          monto: g.monto ? parseFloat(g.monto) : 0,
          pagadorNombre: g.pagadorNombre || 'Usuario',
          pagadorId: g.pagadorId,
          estado: 'Registrado',
          estadoClass: 'status confirmed'
        })));
      }

      const resPart = await api.get(`/participantes/viaje/${id}`);
      let partList = [];
      if (resPart.data) {
        partList = resPart.data.map(p => ({
          id: p.usuarioId || p.id,
          nombre: p.nombreUsuario || 'Participante'
        }));
      }

      // Añadir organizador si no está
      if (orgId && !partList.some(p => p.id === orgId)) {
        partList.unshift({ id: orgId, nombre: orgNombre + ' (Organizador)' });
      }

      setParticipantes(partList);

    } catch (err) {
      console.error('Error al cargar gastos:', err);
      setErrorCarga('No se pudo cargar la información de gastos.');
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

  const abrirModalCrear = () => {
    setGastoAEditar(null);
    setShowCreateModal(true);
  };

  const abrirModalEditar = (gasto) => {
    setGastoAEditar(gasto);
    setShowCreateModal(true);
  };

  const cerrarModal = () => {
    setShowCreateModal(false);
    setGastoAEditar(null);
  };

  const handleSaveSuccess = async (title, message) => {
    setSuccessModalConfig({ isOpen: true, title, message });
    await fetchDatos();
  };

  const handleSaveError = (msg) => {
    showToast(msg);
  };

  const handleConfirmarEliminarGasto = async () => {
    if (!gastoAEliminar) return;
    setIsDeleting(true);
    try {
      await api.delete(`/gastos/${gastoAEliminar.id}`);
      await fetchDatos();
      setSuccessModalConfig({
        isOpen: true,
        title: 'Gasto eliminado',
        message: 'El gasto ha sido eliminado permanentemente del presupuesto.'
      });
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
    if (fechaFiltro !== 'TODAS' && g.rawFecha !== fechaFiltro) {
      return false;
    }
    if (busqueda.trim() !== '') {
      const b = busqueda.toLowerCase();
      const matchConcepto = (g.concepto || '').toLowerCase().includes(b);
      const matchPagador = (g.pagadorNombre || '').toLowerCase().includes(b);
      return matchConcepto || matchPagador;
    }
    return true;
  });






  //----------------------------------------------
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
                    <p className="muted small">Consulta el presupuesto y captura nuevos pagos globales.</p>
                  </div>
                  <button
                    className="button primary"
                    onClick={abrirModalCrear}
                  >
                    + Registrar Gasto
                  </button>
                </div>

                {/* Resumen de Presupuesto */}
                <div className="budget-summary">
                  <article className="card budget-card">
                    <span>Presupuesto total estimado</span>
                    <strong>${totalPresupuesto.toLocaleString('es-MX')}</strong>
                  </article>
                  <article className="card budget-card">
                    <span>Total gastado (capturado)</span>
                    <strong>${totalGastado.toLocaleString('es-MX')}</strong>
                  </article>
                  <article className="card budget-card">
                    <span>Presupuesto disponible</span>
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
                        placeholder="Buscar gasto por concepto o persona..."
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
                        <option value="COMIDA">Comida / Alimentos</option>
                        <option value="ENTRETENIMIENTO">Entretenimiento</option>
                        <option value="OTRO">Otros</option>
                      </select>
                      <input
                        type="date"
                        value={fechaFiltro === 'TODAS' ? '' : fechaFiltro}
                        min={viajeDates.inicio || undefined}
                        max={viajeDates.fin || undefined}
                        onChange={(e) => setFechaFiltro(e.target.value || 'TODAS')}
                        title="Filtrar por fecha específica"
                        className="date-filter"
                      />
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
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gastosFiltrados.length === 0 ? (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
                                Aún no hay gastos registrados.
                              </td>
                            </tr>
                          ) : (
                            gastosFiltrados.map((g) => (
                              <tr key={g.id}>
                                <td>
                                  <strong>{g.concepto}</strong>
                                  <br />
                                  <span className="muted">{g.fecha}</span>
                                </td>
                                <td>{g.categoria}</td>
                                <td><strong>${g.monto.toLocaleString('es-MX')}</strong></td>
                                <td>{g.pagadorNombre}</td>
                                <td>
                                  {(user?.id === viajeOrgId || user?.id === g.pagadorId) && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                      <button
                                        className="button ghost small"
                                        onClick={() => abrirModalEditar(g)}
                                      >
                                        Editar
                                      </button>
                                      <button
                                        className="button danger small"
                                        onClick={() => setGastoAEliminar(g)}
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <aside>
                    <article className="card panel">
                      <span className="eyebrow">ESTADO GLOBAL</span>
                      {disponible >= 0 ? (
                        <>
                          <h2 style={{ color: 'var(--green)' }}>Presupuesto Sano</h2>
                          <p className="muted small">Aún tienes ${disponible.toLocaleString('es-MX')} disponibles antes de rebasar tu estimación inicial.</p>
                        </>
                      ) : (
                        <>
                          <h2 style={{ color: 'var(--red)' }}>Presupuesto Rebasado</h2>
                          <p className="muted small">Has excedido el presupuesto estimado por ${Math.abs(disponible).toLocaleString('es-MX')}.</p>
                        </>
                      )}
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
        message="Esta acción restará permanentemente el monto del total gastado."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmarEliminarGasto}
        onCancel={() => setGastoAEliminar(null)}
        isLoading={isDeleting}
      />

      <SuccessModal
        isOpen={successModalConfig.isOpen}
        title={successModalConfig.title}
        message={successModalConfig.message}
        onAccept={() => setSuccessModalConfig({ isOpen: false, title: '', message: '' })}
      />

      <RegistrarGasto
        isOpen={showCreateModal}
        onClose={cerrarModal}
        gastoAEditar={gastoAEditar}
        viajeId={id}
        participantes={participantes}
        viajeDates={viajeDates}
        onSaveSuccess={handleSaveSuccess}
        onSaveError={handleSaveError}
      />

      {/* Toast Notification */}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </>
  );
}
