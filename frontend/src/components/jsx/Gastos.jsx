import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../css/styles.css'; 
import Navbar from './Navbar';
import ConfirmModal from './ConfirmModal';
import TripHeader from './TripHeader';

export default function Gastos() {
  const { id } = useParams();
  const [deleteExpenseOpen, setDeleteExpenseOpen] = useState(false);

  const handleDeleteExpense = () => {
    setDeleteExpenseOpen(false);
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
                <span>Presupuesto total</span>
                <strong>$12,500</strong>
              </article>
              <article className="card budget-card">
                <span>Total gastado</span>
                <strong>$8,450</strong>
              </article>
              <article className="card budget-card">
                <span>Disponible</span>
                <strong style={{ color: 'var(--green)' }}>$4,050</strong>
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
                      <tr>
                        <td>
                          <strong>Boletos de avión</strong><br/>
                          <span className="muted">10 ago 2026</span>
                        </td>
                        <td>Transporte</td>
                        <td>$4,800</td>
                        <td>Miguel</td>
                        <td><span className="status confirmed">Dividido</span></td>
                        <td><button className="button ghost small">Ver</button></td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Reserva de hotel</strong><br/>
                          <span className="muted">11 ago 2026</span>
                        </td>
                        <td>Hospedaje</td>
                        <td>$2,600</td>
                        <td>Yareli</td>
                        <td><span className="status pending">Pendiente</span></td>
                        <td><button className="button ghost small">Ver</button></td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Cena grupal</strong><br/>
                          <span className="muted">13 ago 2026</span>
                        </td>
                        <td>Alimentos</td>
                        <td>$1,050</td>
                        <td>Jorge</td>
                        <td><span className="status confirmed">Pagado</span></td>
                        <td><button className="button danger small" onClick={() => setDeleteExpenseOpen(true)}>Eliminar</button></td>
                      </tr>
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
