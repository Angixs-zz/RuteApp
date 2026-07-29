import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

const estados = { PLANIFICACION: ['Planeación', 'planning'], PLANEACION: ['Planeación', 'planning'], EN_CURSO: ['En curso', 'active'], FINALIZADO: ['Finalizado', 'finished'], CANCELADO: ['Cancelado', 'cancelled'] };

export default function AdminViajeDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    Promise.allSettled([api.get(`/viajes/${id}`), api.get(`/participantes/viaje/${id}`), api.get(`/actividades/viaje/${id}`), api.get(`/gastos/viaje/${id}`)])
      .then(([viajeResultado, participantesResultado, actividadesResultado, gastosResultado]) => {
        if (!activo) return;
        if (viajeResultado.status === 'rejected') setError('No fue posible cargar el viaje.');
        else setViaje(viajeResultado.value.data);
        if (participantesResultado.status === 'fulfilled') setParticipantes(participantesResultado.value.data ?? []);
        if (actividadesResultado.status === 'fulfilled') setActividades(actividadesResultado.value.data ?? []);
        if (gastosResultado.status === 'fulfilled') setGastos(gastosResultado.value.data ?? []);
        setLoading(false);
      });
    return () => { activo = false; };
  }, [id]);

  const eliminarViaje = async () => {
    try {
      await api.delete(`/viajes/${id}`);
      navigate('/admin/viajes', { replace: true });
    } catch {
      setError('No fue posible eliminar el viaje. Puede tener información relacionada.');
      setConfirmarEliminar(false);
    }
  };

  const rangoFechas = viaje?.fechaInicio
    ? `${new Date(`${viaje.fechaInicio}T00:00:00`).toLocaleDateString('es-MX', { dateStyle: 'medium' })} - ${viaje.fechaFin ? new Date(`${viaje.fechaFin}T00:00:00`).toLocaleDateString('es-MX', { dateStyle: 'medium' }) : 'sin fecha final'}`
    : 'Fechas por definir';
  const [estadoTexto, estadoClase] = estados[viaje?.estado] ?? [viaje?.estado || 'Sin estado', 'planning'];
  const totalGastos = gastos.reduce((total, gasto) => total + Number(gasto.monto || 0), 0);

  return (
    <><Navbar /><main className="page"><div className="container">
      {error && <p className="banner warn">{error}</p>}
      {loading ? <div className="card panel admin-loading"><div className="spinner"></div><p className="muted">Cargando viaje...</p></div> : viaje && <>
        <section className="trip-hero"><div className="trip-hero-content"><div><span className={`status ${estadoClase}`}>{estadoTexto}</span><h1>{viaje.nombre}</h1><p>{viaje.destino || 'Sin destino'} · {rangoFechas}</p></div><div className="form-actions admin-page-actions"><Link className="button ghost" to="/admin/viajes">Volver</Link><Link className="button ghost" to={`/admin/viajes/${id}/editar`}>Editar</Link><button className="button danger" type="button" onClick={() => setConfirmarEliminar(true)}>Eliminar viaje</button></div></div></section>
        <section className="content-card"><div className="section-title"><div><span className="eyebrow">RESUMEN</span><h2>Información del viaje</h2></div></div><div className="info-grid">
          <div className="info-item"><span>Organizador</span><strong>{viaje.organizadorNombre || 'Sin organizador'}</strong></div>
          <div className="info-item"><span>Origen</span><strong>{viaje.origen || 'Sin origen'}</strong></div>
          <div className="info-item"><span>Destino</span><strong>{viaje.destino || 'Sin destino'}</strong></div>
          <div className="info-item"><span>Transporte</span><strong>{viaje.transporte || 'Sin definir'}</strong></div>
          <div className="info-item"><span>Participantes</span><strong>{participantes.length}</strong></div>
          <div className="info-item"><span>Actividades</span><strong>{actividades.length}</strong></div>
          <div className="info-item"><span>Presupuesto estimado</span><strong>${Number(viaje.presupuestoEstimado || 0).toLocaleString('es-MX')}</strong></div>
          <div className="info-item"><span>Gastos registrados</span><strong>${totalGastos.toLocaleString('es-MX')}</strong></div>
          <div className="info-item"><span>Visibilidad</span><strong>{viaje.publico ? 'Público' : 'Privado'}</strong></div>
        </div>{viaje.descripcion && <section className="form-section"><h3>Descripción</h3><p className="muted">{viaje.descripcion}</p></section>}</section>
      </>}
    </div></main><ConfirmModal isOpen={confirmarEliminar} title="Eliminar viaje" message={`¿Deseas eliminar “${viaje?.nombre ?? 'este viaje'}”? Esta acción no se puede deshacer.`} confirmText="Eliminar" onConfirm={eliminarViaje} onCancel={() => setConfirmarEliminar(false)} /></>
  );
}
