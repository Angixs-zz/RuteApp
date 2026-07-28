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
  const [gastoAEliminar, setGastoAEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const cachedGastos = sessionStorage.getItem(`gastos_${id}`);
  const [gastos, setGastos] = useState(cachedGastos ? JSON.parse(cachedGastos) : []);
  const [loading, setLoading] = useState(!cachedGastos);
  const [isUpdating, setIsUpdating] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  
  // Cargar instantáneamente el presupuesto de la caché para evitar que el usuario perciba lag
  const cachedTrip = sessionStorage.getItem(`trip_${id}`);
  const viajeData = cachedTrip ? JSON.parse(cachedTrip) : null;
  const [viajePresupuesto, setViajePresupuesto] = useState(viajeData?.presupuestoEstimado || 0);

  const fetchGastos = async () => {
    setIsUpdating(true);
    try {
      const resGastos = await api.get(`/gastos/viaje/${id}`, { timeout: 1500 });
      const newGastos = resGastos.data || [];
      setGastos(newGastos);
      sessionStorage.setItem(`gastos_${id}`, JSON.stringify(newGastos));
    } catch (err) {
      console.error("Error cargando gastos", err);
      setFetchError(true);
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (id) fetchGastos();
  }, [id]);

  const handleDeleteExpense = async () => {
    if (!gastoAEliminar) return;
    
    setIsDeleting(true);
    const idToDelete = gastoAEliminar;

    try {
      // 1. Optimistic update para asegurar que la UI (lista y saldos) se actualice de inmediato
      const updatedGastos = gastos.filter(g => g.id !== idToDelete);
      setGastos(updatedGastos);
      sessionStorage.setItem(`gastos_${id}`, JSON.stringify(updatedGastos));

      // 2. Eliminar en el servidor
      await api.delete(`/gastos/${idToDelete}`);
      
      // 3. Forzar recarga en segundo plano para confirmar consistencia
      fetchGastos();
      
    } catch (err) {
      console.error("Error al eliminar gasto:", err);
      alert("No se pudo eliminar el gasto en el servidor.");
      // Rollback en caso de error
      fetchGastos();
    } finally {
      setIsDeleting(false);
      setGastoAEliminar(null);
    }
  };

  const currentUserId = user?.id || 1;
  const miGastoTotal = gastos
    .filter(g => Number(g.pagadorId) === Number(currentUserId))
    .reduce((sum, g) => sum + (g.monto || 0), 0);
  const disponible = viajePresupuesto - miGastoTotal;

  const formatearFecha = (fechaString) => {
    if (!fechaString) return '';
    const date = new Date(fechaString + 'T00:00:00');
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // --- Lógica para Gráfica de Dona Dinámica ---
  const gastosPorCategoria = gastos.reduce((acc, g) => {
    const cat = g.categoria || 'OTRO';
    acc[cat] = (acc[cat] || 0) + (g.monto || 0);
    return acc;
  }, {});

  const totalGastosGenerales = gastos.reduce((sum, g) => sum + (g.monto || 0), 0);

  const colors = {
    TRANSPORTE: '#3B82F6', 
    HOSPEDAJE: '#8B5CF6',  
    COMIDA: '#F59E0B',     
    ENTRETENIMIENTO: '#EC4899', 
    OTRO: '#6B7280'        
  };

  let currentPercentage = 0;
  const gradientStops = Object.keys(gastosPorCategoria).map(cat => {
    const percentage = (gastosPorCategoria[cat] / totalGastosGenerales) * 100;
    const start = currentPercentage;
    const end = currentPercentage + percentage;
    currentPercentage = end;
    return `${colors[cat]} ${start}% ${end}%`;
  });

  const donutStyle = totalGastosGenerales > 0 
    ? { background: `conic-gradient(${gradientStops.join(', ')})` }
    : {};
  // ---------------------------------------------

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="container">
          
          <TripHeader id={id} currentTab="gastos" />

          <section className="content-card">
            <div className="section-title">
              <div>
                <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Gastos del viaje
                  {isUpdating && <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#FEF3C7', color: '#92400E', borderRadius: '12px', fontWeight: 'bold' }}>Actualizando...</span>}
                </h2>
                <p className="muted small">Consulta el presupuesto y los pagos pendientes.</p>
              </div>
              <Link className="button primary" to={`/viajes/${id}/registrar-gasto`}>＋ Registrar gasto</Link>
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
                            <td>{g.pagadorNombre || '-'}</td>
                            <td><span className="status confirmed">Confirmado</span></td>
                            <td><button className="button danger small" onClick={() => setGastoAEliminar(g.id)}>Eliminar</button></td>
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
                      <div className="donut" style={donutStyle}></div>
                      <div className="legend">
                        {Object.keys(gastosPorCategoria).map(cat => (
                          <span key={cat}>
                            <span style={{display:'inline-block', width:'10px', height:'10px', backgroundColor:colors[cat], borderRadius:'50%', marginRight:'5px'}}></span>
                            {cat} <br/><strong style={{fontSize:'0.85rem'}}>${gastosPorCategoria[cat].toLocaleString('es-MX')}</strong>
                          </span>
                        ))}
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
            isOpen={!!gastoAEliminar}
            title="Eliminar gasto"
            message="¿Estás seguro de que deseas eliminar este gasto de forma permanente?"
            confirmText="Eliminar"
            cancelText="Cancelar"
            onConfirm={handleDeleteExpense}
            onCancel={() => setGastoAEliminar(null)}
            isLoading={isDeleting}
          />

        </div>
      </main>
      <div className="toast"></div>
    </>
  );
}
