import { useState, useEffect } from 'react';
import { PartyPopper } from 'lucide-react';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

export default function Invitaciones() {
  const [invitaciones, setInvitaciones] = useState([]);

  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');
  const [invitacionSeleccionada, setInvitacionSeleccionada] = useState(null);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  useEffect(() => {
    async function cargarInvitaciones() {
      try {
        setErrorCarga('');
        const res = await api.get('/participantes');
        const participantes = Array.isArray(res.data) ? res.data : [];
        setInvitaciones(
          participantes.filter((participante) => participante.estadoInvitacion === 'PENDIENTE')
        );
      } catch (error) {
        console.error('Error al consultar invitaciones:', error);
        setInvitaciones([]);
        setErrorCarga('No fue posible consultar tus invitaciones. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    }

    cargarInvitaciones();
  }, []);

  const abrirModal = (invitacion, respuesta) => {
    setInvitacionSeleccionada(invitacion);
    setRespuestaSeleccionada(respuesta);
  };

  const cerrarModal = () => {
    if (procesando) return;
    setInvitacionSeleccionada(null);
    setRespuestaSeleccionada('');
  };

  const handleResponder = async () => {
    if (!invitacionSeleccionada || !respuestaSeleccionada) return;
    const aceptada = respuestaSeleccionada === 'ACEPTADA';
    setProcesando(true);
    try {
      //acepta o rechaza una invitacion
      await api.patch(`/participantes/${invitacionSeleccionada.id}/respuesta`, {
        respuesta: respuestaSeleccionada,
      });
      setInvitaciones(prev => prev.filter(inv => inv.id !== invitacionSeleccionada.id));
      setInvitacionSeleccionada(null);
      setRespuestaSeleccionada('');
      showToast(aceptada ? 'Invitación aceptada' : 'Invitación rechazada');
    } catch (error) {
      const accion = aceptada ? 'aceptar' : 'rechazar';
      showToast(error.response?.data?.mensaje || `No fue posible ${accion} la invitación`);
    } finally {
      setProcesando(false);
    }
  };

  const formatearFechas = (inicio, fin) => {
    if (!inicio || !fin) return 'Fechas por definir';
    const fechaInicio = new Date(`${inicio}T00:00:00`);
    const fechaFin = new Date(`${fin}T00:00:00`);
    return `${fechaInicio.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} – ${fechaFin.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  return (
    <>
      <Navbar invitacionesCount={invitaciones.length} />
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
          ) : errorCarga ? (
            <div className="banner warn">
              <div><strong>No se pudieron cargar las invitaciones</strong><span>{errorCarga}</span></div>
            </div>
          ) : invitaciones.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#6B7280' }}>
              <div style={{ marginBottom: '1rem' }}><PartyPopper size={48} color="#9CA3AF" style={{ margin: '0 auto' }} /></div>
              <h3>¡No tienes invitaciones pendientes!</h3>
              <p className="muted">Cuando tus amigos te inviten a un viaje aparecerán aquí.</p>
            </div>
          ) : (
            <div className="cards-3">
              {invitaciones.map((inv) => (
                <article key={inv.id} className="card trip-card">
                  <div className={inv.id % 2 === 0 ? 'trip-cover puebla' : 'trip-cover'}></div>
                  <div className="trip-body">
                    <span className="status pending">Pendiente</span>
                    <h3>{inv.nombreViaje || 'Viaje invitado'}</h3>
                    <p>
                      Invitación de {inv.nombreOrganizador || 'Organizador'} ·{' '}
                      {formatearFechas(inv.fechaInicioViaje, inv.fechaFinViaje)}
                    </p>
                    <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                      <button
                        className="button primary"
                        onClick={() => abrirModal(inv, 'ACEPTADA')}
                      >
                        Aceptar
                      </button>
                      <button
                        className="button ghost"
                        onClick={() => abrirModal(inv, 'RECHAZADA')}
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

      <div className={`modal-backdrop ${invitacionSeleccionada ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-icon">{respuestaSeleccionada === 'ACEPTADA' ? '✓' : '✕'}</div>
          <h3>{respuestaSeleccionada === 'ACEPTADA' ? 'Aceptar invitación' : 'Rechazar invitación'}</h3>
          <p className="muted">
            {respuestaSeleccionada === 'ACEPTADA'
              ? 'El viaje aparecerá en “Mis viajes” y el organizador será notificado.'
              : 'El organizador recibirá tu respuesta.'}
          </p>
          <div className="modal-actions">
            <button
              className="button ghost"
              onClick={cerrarModal}
              disabled={procesando}
            >
              {respuestaSeleccionada === 'ACEPTADA' ? 'Cancelar' : 'Volver'}
            </button>
            <button
              className={respuestaSeleccionada === 'ACEPTADA' ? 'button primary' : 'button danger'}
              onClick={handleResponder}
              disabled={procesando}
            >
              {procesando
                ? 'Procesando...'
                : respuestaSeleccionada === 'ACEPTADA' ? 'Aceptar' : 'Rechazar'}
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
