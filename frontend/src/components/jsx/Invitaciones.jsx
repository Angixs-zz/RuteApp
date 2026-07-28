import { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

export default function Invitaciones() {
  const [invitaciones, setInvitaciones] = useState([
    {
      id: 1,
      viajeId: 1,
      titulo: 'Escapada a Cancún',
      organizador: 'Yareli',
      fechas: '12–16 de agosto',
      coverClass: 'trip-cover',
      estado: 'PENDIENTE'
    },
    {
      id: 2,
      viajeId: 2,
      titulo: 'Festival en Puebla',
      organizador: 'Jorge',
      fechas: '05–07 de septiembre',
      coverClass: 'trip-cover puebla',
      estado: 'PENDIENTE'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [invitacionSeleccionada, setInvitacionSeleccionada] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const fetchInvitaciones = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/participantes');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const pendientes = res.data.filter(p => p.estadoInvitacion === 'PENDIENTE');
        if (pendientes.length > 0) {
          setInvitaciones(pendientes.map(p => ({
            id: p.id,
            viajeId: p.viajeId,
            titulo: p.nombreViaje || 'Viaje invitado',
            organizador: p.nombreUsuario || 'Organizador',
            fechas: '12–16 de agosto',
            coverClass: p.id % 2 === 0 ? 'trip-cover puebla' : 'trip-cover',
            estado: 'PENDIENTE'
          })));
        }
      }
    } catch {
      // Fallback a los datos mock iniciales del prototipo
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        fetchInvitaciones();
      }
    });
    return () => {
      active = false;
    };
  }, [fetchInvitaciones]);

  const handleConfirmarAceptar = async () => {
    if (!invitacionSeleccionada) return;
    try {
      await api.put(`/participantes/${invitacionSeleccionada.id}`, {
        estadoInvitacion: 'CONFIRMADO'
      });
    } catch {
      // Fallback
    }

    setInvitaciones(prev => prev.filter(inv => inv.id !== invitacionSeleccionada.id));
    setShowAcceptModal(false);
    setInvitacionSeleccionada(null);
    showToast('Invitación aceptada');
  };

  const handleConfirmarRechazar = async () => {
    if (!invitacionSeleccionada) return;
    try {
      await api.delete(`/participantes/${invitacionSeleccionada.id}`);
    } catch {
      // Fallback
    }

    setInvitaciones(prev => prev.filter(inv => inv.id !== invitacionSeleccionada.id));
    setShowRejectModal(false);
    setInvitacionSeleccionada(null);
    showToast('Invitación rechazada');
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="eyebrow">PENDIENTES DE RESPUESTA</span>
              <h1>Invitaciones</h1>
              <p className="muted">Acepta o rechaza invitaciones a nuevos viajes.</p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6B7280' }}>
              Cargando invitaciones...
            </div>
          ) : invitaciones.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#6B7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h3>¡No tienes invitaciones pendientes!</h3>
              <p className="muted">Cuando tus amigos te inviten a un viaje aparecerán aquí.</p>
            </div>
          ) : (
            <div className="cards-3">
              {invitaciones.map((inv) => (
                <article key={inv.id} className="card trip-card">
                  <div className={inv.coverClass}></div>
                  <div className="trip-body">
                    <span className="status pending">Pendiente</span>
                    <h3>{inv.titulo}</h3>
                    <p>Invitación de {inv.organizador} · {inv.fechas}</p>
                    <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                      <button 
                        className="button primary"
                        onClick={() => {
                          setInvitacionSeleccionada(inv);
                          setShowAcceptModal(true);
                        }}
                      >
                        Aceptar
                      </button>
                      <button 
                        className="button ghost"
                        onClick={() => {
                          setInvitacionSeleccionada(inv);
                          setShowRejectModal(true);
                        }}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Aceptar Invitación */}
      <div className={`modal-backdrop ${showAcceptModal ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-icon">✓</div>
          <h3>Aceptar invitación</h3>
          <p className="muted">
            El viaje aparecerá en “Mis viajes” y el organizador será notificado.
          </p>
          <div className="modal-actions">
            <button 
              className="button ghost" 
              onClick={() => setShowAcceptModal(false)}
            >
              Cancelar
            </button>
            <button 
              className="button primary" 
              onClick={handleConfirmarAceptar}
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>

      {/* Modal Rechazar Invitación */}
      <div className={`modal-backdrop ${showRejectModal ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-icon">✕</div>
          <h3>Rechazar invitación</h3>
          <p className="muted">
            El organizador recibirá tu respuesta.
          </p>
          <div className="modal-actions">
            <button 
              className="button ghost" 
              onClick={() => setShowRejectModal(false)}
            >
              Volver
            </button>
            <button 
              className="button danger" 
              onClick={handleConfirmarRechazar}
            >
              Rechazar
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
