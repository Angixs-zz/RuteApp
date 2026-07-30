import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../service/api';
import ConfirmModal from './ConfirmModal';
import SuccessModal from './SuccessModal';
import { AuthContext } from '../../context/AuthContext';

export default function TripHeader({ id, currentTab }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [viaje, setViaje] = useState(() => {
    const cached = sessionStorage.getItem(`trip_${id}`);
    if (cached) return JSON.parse(cached);
    return {
      nombre: 'Cargando...',
      destino: '',
      fechaInicio: '',
      fechaFin: '',
      estado: 'EN_CURSO'
    };
  });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [successModalConfig, setSuccessModalConfig] = useState({ isOpen: false, title: '', message: '' });

  const fetchDetalleViaje = useCallback(async () => {
    if (!id) return;
    try {
      // Timeout aumentado a 5 segundos por si el backend tarda en responder
      const response = await api.get(`/viajes/${id}`, { timeout: 5000 });
      if (response.data) {
        setViaje(response.data);
        sessionStorage.setItem(`trip_${id}`, JSON.stringify(response.data));
      }
    } catch (err) {
      console.error('Error al cargar detalle del viaje en TripHeader:', err);
      // Si falla la petición (CORS, Timeout, etc.), simplemente nos quedamos con lo que
      // ya tenemos en caché o en memoria. NO SOBREESCRIBIMOS con datos falsos.
    }
  }, [id]);

  useEffect(() => {
    fetchDetalleViaje();
  }, [fetchDetalleViaje]);

  const handleCancelarViaje = async () => {
    try {
      await api.put(`/viajes/${id}`, { ...viaje, estado: 'CANCELADO' });
      setViaje(prev => ({ ...prev, estado: 'CANCELADO' }));
      sessionStorage.setItem(`trip_${id}`, JSON.stringify({ ...viaje, estado: 'CANCELADO' }));
    } catch (err) {
      console.error('Error al cancelar:', err);
    }
    setShowCancelModal(false);
    setSuccessModalConfig({
      isOpen: true,
      title: 'Viaje Cancelado',
      message: 'El viaje ha sido cancelado exitosamente.'
    });
  };

  const calcularEstadoReal = (inicio, fin) => {
    if (!inicio || !fin) return 'PLANIFICACION';
    const hoy = new Date().toISOString().split('T')[0];
    if (hoy < inicio) return 'PLANIFICACION';
    if (hoy > fin) return 'FINALIZADO';
    return 'EN_CURSO';
  };

  const handleReanudarViaje = async () => {
    try {
      const nuevoEstado = calcularEstadoReal(viaje.fechaInicio, viaje.fechaFin);
      await api.put(`/viajes/${id}`, { ...viaje, estado: nuevoEstado });
      setViaje(prev => ({ ...prev, estado: nuevoEstado }));
      sessionStorage.setItem(`trip_${id}`, JSON.stringify({ ...viaje, estado: nuevoEstado }));
    } catch (err) {
      console.error('Error al reanudar:', err);
    }
    setShowResumeModal(false);
    setSuccessModalConfig({
      isOpen: true,
      title: 'Viaje Reanudado',
      message: 'El viaje ha sido reanudado exitosamente.'
    });
  };

  const handleSuccessAccept = () => {
    setSuccessModalConfig({ isOpen: false, title: '', message: '' });
    window.location.reload(); // Recargar para sincronizar DetalleViaje
  };

  const formatearEstado = (estado) => {
    switch (estado) {
      case 'PLANIFICACION': return { label: 'Planeación', className: 'status planning' };
      case 'EN_CURSO': return { label: 'Confirmado', className: 'status confirmed' };
      case 'FINALIZADO': return { label: 'Finalizado', className: 'status finished' };
      case 'CANCELADO': return { label: 'Cancelado', className: 'status cancelled' };
      default: return { label: 'Confirmado', className: 'status confirmed' };
    }
  };

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

  const estadoBadge = formatearEstado(viaje.estado);

  return (
    <>
      <section className="trip-hero">
        <div className="trip-hero-content">
          <div>
            <span className={estadoBadge.className}>{estadoBadge.label}</span>
            <h1>{viaje.nombre}</h1>
            <p>{viaje.destino} · {formatearFechas(viaje.fechaInicio, viaje.fechaFin)}</p>
          </div>
          {user?.id === viaje.organizadorId && (
            viaje.estado !== 'CANCELADO' ? (
              <button className="button ghost" onClick={() => setShowCancelModal(true)}>
                Cancelar viaje
              </button>
            ) : (
              <button className="button ghost" onClick={() => setShowResumeModal(true)}>
                Reanudar viaje
              </button>
            )
          )}
        </div>
      </section>

      <nav className="tabs">
        <Link className={currentTab === 'resumen' ? 'active' : ''} to={`${window.location.pathname.includes('/viajes-agencia') ? '/viajes-agencia' : '/viajes'}/${id}`}>Resumen</Link>
        {user?.rol !== 'AGENCIA' && (
          <Link className={currentTab === 'participantes' ? 'active' : ''} to={`${window.location.pathname.includes('/viajes-agencia') ? '/viajes-agencia' : '/viajes'}/${id}/participantes`}>Participantes</Link>
        )}
        <Link className={currentTab === 'itinerario' ? 'active' : ''} to={`${window.location.pathname.includes('/viajes-agencia') ? '/viajes-agencia' : '/viajes'}/${id}/itinerario`}>Itinerario</Link>
        {user?.rol !== 'AGENCIA' && (
          <Link className={currentTab === 'gastos' ? 'active' : ''} to={`${window.location.pathname.includes('/viajes-agencia') ? '/viajes-agencia' : '/viajes'}/${id}/gastos`}>Gastos</Link>
        )}
      </nav>

      <ConfirmModal 
        isOpen={showCancelModal}
        title="¿Cancelar este viaje?"
        message="Los participantes recibirán una notificación y el viaje cambiará al estado cancelado."
        confirmText="Cancelar viaje"
        cancelText="Volver"
        onConfirm={handleCancelarViaje}
        onCancel={() => setShowCancelModal(false)}
      />

      <ConfirmModal 
        isOpen={showResumeModal}
        title="¿Reanudar este viaje?"
        message="El viaje volverá a estar activo y el estado se actualizará según las fechas programadas."
        confirmText="Reanudar viaje"
        cancelText="Volver"
        onConfirm={handleReanudarViaje}
        onCancel={() => setShowResumeModal(false)}
      />

      <SuccessModal 
        isOpen={successModalConfig.isOpen}
        title={successModalConfig.title}
        message={successModalConfig.message}
        onAccept={handleSuccessAccept}
      />
    </>
  );
}
