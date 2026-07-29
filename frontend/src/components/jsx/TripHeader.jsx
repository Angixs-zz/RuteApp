import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../service/api';
import ConfirmModal from './ConfirmModal';

export default function TripHeader({ id, currentTab }) {
  const navigate = useNavigate();
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
    } catch (err) {
      console.error('Error al cancelar:', err);
    }
    setViaje(prev => ({ ...prev, estado: 'CANCELADO' }));
    setShowCancelModal(false);
    navigate(`/viajes/${id}`);
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
          {viaje.estado !== 'CANCELADO' && (
            <button className="button ghost" onClick={() => setShowCancelModal(true)}>
              Cancelar viaje
            </button>
          )}
        </div>
      </section>

      <nav className="tabs">
        <Link className={currentTab === 'resumen' ? 'active' : ''} to={`/viajes/${id}`}>Resumen</Link>
        <Link className={currentTab === 'participantes' ? 'active' : ''} to={`/viajes/${id}/participantes`}>Participantes</Link>
        <Link className={currentTab === 'itinerario' ? 'active' : ''} to={`/viajes/${id}/itinerario`}>Itinerario</Link>
        <Link className={currentTab === 'gastos' ? 'active' : ''} to={`/viajes/${id}/gastos`}>Gastos</Link>
        <Link className={currentTab === 'notificaciones' ? 'active' : ''} to={`/viajes/${id}/notificaciones`}>Notificaciones</Link>
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
    </>
  );
}
