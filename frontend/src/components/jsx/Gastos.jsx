import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../css/styles.css'; 
import Navbar from './Navbar';
import ConfirmModal from './ConfirmModal';
import TripHeader from './TripHeader';
import api from '../../service/api';
import { AuthContext } from '../../context/AuthContext';

export default function Gastos() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [deleteExpenseOpen, setDeleteExpenseOpen] = useState(false);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [viajePresupuesto, setViajePresupuesto] = useState(0);

  useEffect(() => {
    const fetchGastos = async () => {
      try {
        const resViaje = await api.get(`/viajes/${id}`, { timeout: 1500 });
        if (resViaje.data && resViaje.data.presupuestoEstimado) {
          setViajePresupuesto(resViaje.data.presupuestoEstimado);
        }

        const res = await api.get(`/gastos/viaje/${id}`, { timeout: 1500 });
        setGastos(res.data || []);
      } catch (err) {
        console.error("Error cargando gastos", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchGastos();
  }, [id]);

  const handleDeleteExpense = () => {
    setDeleteExpenseOpen(false);
  };

  const miGastoTotal = gastos
    .filter(g => g.pagador?.id === user?.id)
    .reduce((sum, g) => sum + (g.monto || 0), 0);
  const disponible = viajePresupuesto - miGastoTotal;

  const formatearFecha = (fechaString) => {
    if (!fechaString) return '';
    const date = new Date(fechaString + 'T00:00:00');
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="container">
          
          <TripHeader id={id} currentTab="gastos" />

          <section className="content-card">
            <div className="section-title">
              <div>
                <h2>Gastos del viaje</h2>
                <p className="muted small">Consulta el presupuesto y los pagos pendientes.</p>
              </div>
              <Link className="button primary" to="/registrar-gasto">＋ Registrar gasto</Link>
            </div>
            
            <div className="budget-summary">
              <article className="card budget-card">
                <span>Presupuesto por persona</span>
                <strong>${viajePresupuesto.toLocaleString('es-MX')}</strong>
              </article>
              <article className="card budget-card">
                <span>Tus gastos</span>
                <strong>${miGastoTotal.toLocaleString('es-MX')}</strong>
              </article>
              <article className="card budget-card">
                <span>Disponible</span>
                <strong style={{ color: disponible >= 0 ? 'var(--green)' : 'var(--coral)' }}>
                  ${disponible.toLocaleString('es-MX')}
                </strong>
              </article>
            </div>
            
            <div className="expense-layout">
              <div>
                <div className="filters" style={{ gridTemplateColumns: '1fr 180px 180px' }}>
                  <input placeholder="Buscar gasto" />
                  <select>
                    <option>Todas las categorías</option>
                    <option>Transporte</option>
                    <option>Alimentos</option>
                  </select>
                  <select>
                    <option>Todas las fechas</option>
                  </select>
                </div>
                
                <div className="table-wrap">
                  {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Cargando gastos...</div>
                  ) : fetchError ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>
                      ⚠️ No se pudo conectar con el servidor. Revisa si el backend está encendido.
                    </div>
                  ) : gastos.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Aún no hay gastos registrados.</div>
                  ) : (
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
                        {gastos.map(g => (
                          <tr key={g.id}>
                            <td>
                              <strong>{g.concepto}</strong><br/>
                              <span className="muted">{formatearFecha(g.fecha)}</span>
                            </td>
                            <td>{g.categoria}</td>
                            <td>${(g.monto || 0).toLocaleString('es-MX')}</td>
                            <td>{g.pagador?.nombre || '-'}</td>
                            <td><span className="status confirmed">Confirmado</span></td>
                            <td><button className="button danger small" onClick={() => setDeleteExpenseOpen(true)}>Eliminar</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              
              <aside>
                <article className="card chart-card">
                  <span className="eyebrow">POR CATEGORÍA</span>
                  <h3>Distribución de gastos</h3>
                  {gastos.length > 0 ? (
                    <>
                      <div className="donut"></div>
                      <div className="legend">
                        <span>Transporte</span>
                        <span>Hospedaje</span>
                        <span>Alimentos</span>
                        <span>Actividades</span>
                      </div>
                    </>
                  ) : (
                    <p className="muted small" style={{marginTop: '1rem'}}>Sin datos para mostrar.</p>
                  )}
                </article>
                <article className="card panel" style={{ marginTop: '16px' }}>
                  <span className="eyebrow">TU SALDO</span>
                  <h2 style={{ color: disponible >= 0 ? 'var(--green)' : 'var(--coral)' }}>
                    ${disponible.toLocaleString('es-MX')} {disponible >= 0 ? 'restantes' : 'excedidos'}
                  </h2>
                  <p className="muted small">Basado en tu presupuesto por persona.</p>
                </article>
              </aside>
            </div>
          </section>

          <ConfirmModal 
            isOpen={deleteExpenseOpen}
            title="Eliminar gasto"
            message="Se eliminarán también las divisiones asociadas."
            confirmText="Eliminar"
            cancelText="Cancelar"
            onConfirm={handleDeleteExpense}
            onCancel={() => setDeleteExpenseOpen(false)}
          />

        </div>
      </main>
      <div className="toast"></div>
    </>
  );
}
