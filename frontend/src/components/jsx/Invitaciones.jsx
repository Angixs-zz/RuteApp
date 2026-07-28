import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import ConfirmModal from './ConfirmModal';
import '../css/styles.css'; 

export default function Invitaciones() {
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const handleAccept = () => {
    // Lógica para aceptar invitación
    setAcceptModalOpen(false);
  };

  const handleReject = () => {
    // Lógica para rechazar invitación
    setRejectModalOpen(false);
  };

  return (
    <>
      <Navbar invitacionesCount={2} />
      
      <main className="page">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="eyebrow">PENDIENTES DE RESPUESTA</span>
              <h1>Invitaciones</h1>
              <p className="muted">Acepta o rechaza invitaciones a nuevos viajes.</p>
            </div>
          </div>
          
          <div className="cards-3">
            <article className="card trip-card">
              <div className="trip-cover"></div>
              <div className="trip-body">
                <span className="status pending">Pendiente</span>
                <h3>Escapada a Cancún</h3>
                <p>Invitación de Yareli · 12–16 de agosto</p>
                <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                  <button className="button primary" onClick={() => setAcceptModalOpen(true)}>Aceptar</button>
                  <button className="button ghost" onClick={() => setRejectModalOpen(true)}>Rechazar</button>
                </div>
              </div>
            </article>
            
            <article className="card trip-card">
              <div className="trip-cover puebla"></div>
              <div className="trip-body">
                <span className="status pending">Pendiente</span>
                <h3>Festival en Puebla</h3>
                <p>Invitación de Jorge · 05–07 de septiembre</p>
                <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                  <button className="button primary" onClick={() => setAcceptModalOpen(true)}>Aceptar</button>
                  <button className="button ghost" onClick={() => setRejectModalOpen(true)}>Rechazar</button>
                </div>
              </div>
            </article>
          </div>

          <ConfirmModal 
            isOpen={acceptModalOpen}
            title="Aceptar invitación"
            message="El viaje aparecerá en “Mis viajes” y el organizador será notificado."
            confirmText="Aceptar"
            cancelText="Cancelar"
            onConfirm={handleAccept}
            onCancel={() => setAcceptModalOpen(false)}
          />

          <ConfirmModal 
            isOpen={rejectModalOpen}
            title="Rechazar invitación"
            message="El organizador recibirá tu respuesta."
            confirmText="Rechazar"
            cancelText="Volver"
            onConfirm={handleReject}
            onCancel={() => setRejectModalOpen(false)}
          />
        </div>
      </main>
      <div className="toast"></div>
    </>
  );
}
