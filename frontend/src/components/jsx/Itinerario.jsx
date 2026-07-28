import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/styles.css'; 
import Navbar from './Navbar';
import ConfirmModal from './ConfirmModal';

export default function Itinerario() {
  const [cancelTripOpen, setCancelTripOpen] = useState(false);
  const [deleteActivityOpen, setDeleteActivityOpen] = useState(false);

  const handleCancelTrip = () => {
    setCancelTripOpen(false);
  };

  const handleDeleteActivity = () => {
    setDeleteActivityOpen(false);
  };

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="container">
          <section className="trip-hero">
            <div className="trip-hero-content">
              <div>
                <span className="status confirmed">Confirmado</span>
                <h1>Escapada a Cancún</h1>
                <p>Quintana Roo, México · 12–16 de agosto de 2026</p>
              </div>
              <button className="button ghost" onClick={() => setCancelTripOpen(true)}>Cancelar viaje</button>
            </div>
          </section>

          <ConfirmModal 
            isOpen={cancelTripOpen}
            title="¿Cancelar este viaje?"
            message="Los participantes recibirán una notificación y el viaje cambiará al estado cancelado."
            confirmText="Cancelar viaje"
            cancelText="Volver"
            onConfirm={handleCancelTrip}
            onCancel={() => setCancelTripOpen(false)}
          />

          <nav className="tabs">
            <Link className="" to="/detalle-viaje">Resumen</Link>
            <Link className="" to="/participantes">Participantes</Link>
            <Link className="active" to="/itinerario">Itinerario</Link>
            <Link className="" to="/gastos">Gastos</Link>
            <Link className="" to="/notificaciones">Notificaciones</Link>
          </nav>

          <section className="content-card">
            <div className="section-title">
              <div>
                <h2>Itinerario</h2>
                <p className="muted small">Actividades organizadas por día.</p>
              </div>
              <Link className="button primary" to="/crear-actividad">＋ Agregar actividad</Link>
            </div>
            
            <div className="timeline">
              <section className="timeline-day">
                <h3>Miércoles, 12 de agosto</h3>
                <div className="timeline-items">
                  <article className="card timeline-card">
                    <div className="time-box">08:30</div>
                    <div>
                      <span className="status active">Transporte</span>
                      <h3>Vuelo Oaxaca–Cancún</h3>
                      <p className="muted small">Aeropuerto Internacional de Oaxaca · Responsable: Miguel</p>
                    </div>
                    <button className="button ghost small">Editar</button>
                  </article>
                  
                  <article className="card timeline-card">
                    <div className="time-box">15:00</div>
                    <div>
                      <span className="status confirmed">Hospedaje</span>
                      <h3>Registro en el hotel</h3>
                      <p className="muted small">Zona Hotelera · Responsable: Yareli</p>
                    </div>
                    <button className="button ghost small">Editar</button>
                  </article>
                </div>
              </section>

              <section className="timeline-day">
                <h3>Jueves, 13 de agosto</h3>
                <div className="timeline-items">
                  <article className="card timeline-card">
                    <div className="time-box">09:00</div>
                    <div>
                      <span className="status planning">Actividad</span>
                      <h3>Visita a Isla Mujeres</h3>
                      <p className="muted small">Muelle Cancún · Costo estimado: $1,200</p>
                    </div>
                    <button className="button ghost small">Editar</button>
                  </article>
                  
                  <article className="card timeline-card">
                    <div className="time-box">19:30</div>
                    <div>
                      <span className="status planning">Alimentos</span>
                      <h3>Cena grupal</h3>
                      <p className="muted small">Restaurante La Habichuela · Responsable: Jorge</p>
                    </div>
                    <button className="button danger small" onClick={() => setDeleteActivityOpen(true)}>Eliminar</button>
                  </article>
                </div>
              </section>
            </div>
          </section>

          <ConfirmModal 
            isOpen={deleteActivityOpen}
            title="Eliminar actividad"
            message="La actividad desaparecerá del itinerario de todos los participantes."
            confirmText="Eliminar"
            cancelText="Cancelar"
            onConfirm={handleDeleteActivity}
            onCancel={() => setDeleteActivityOpen(false)}
          />

        </div>
      </main>
      <div className="toast"></div>
    </>
  );
}
