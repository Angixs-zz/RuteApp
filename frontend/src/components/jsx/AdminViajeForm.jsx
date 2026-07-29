import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

export default function AdminViajeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let activo = true;
    Promise.all([api.get(`/viajes/${id}`), api.get('/usuarios/paginados', { params: { page: 0, size: 50, activo: true } })]).then(([viaje, usuariosRespuesta]) => {
      if (!activo) return;
      setForm(viaje.data); setUsuarios(usuariosRespuesta.data?.contenido ?? []);
    }).catch(() => { if (activo) setError('No fue posible cargar el viaje.'); });
    return () => { activo = false; };
  }, [id]);

  const cambiar = (event) => { const { name, value, type, checked } = event.target; setForm((actual) => ({ ...actual, [name]: type === 'checkbox' ? checked : value })); setErrores((actual) => ({ ...actual, [name]: '' })); };
  const guardar = async (event) => {
    event.preventDefault();
    const nuevos = {};
    ['nombre', 'origen', 'destino', 'fechaInicio', 'fechaFin', 'organizadorId'].forEach((campo) => { if (!form[campo]) nuevos[campo] = 'Este campo es obligatorio.'; });
    if (form.fechaFin && form.fechaInicio && form.fechaFin < form.fechaInicio) nuevos.fechaFin = 'La fecha final no puede ser anterior.';
    setErrores(nuevos); if (Object.keys(nuevos).length) return;
    setGuardando(true); setError('');
    try { await api.put(`/viajes/${id}`, { ...form, organizadorId: Number(form.organizadorId), presupuestoEstimado: Number(form.presupuestoEstimado || 0) }); navigate(`/admin/viajes/${id}`); }
    catch (err) { setError(err.response?.data?.mensaje || 'No fue posible guardar el viaje.'); }
    finally { setGuardando(false); }
  };

  if (!form) return <><Navbar /><main className="page"><div className="container"><div className="card panel admin-loading"><div className="spinner"></div><p>{error || 'Cargando viaje...'}</p></div></div></main></>;
  const campo = (nombre, etiqueta, tipo = 'text') => <label className="field"><span>{etiqueta} *</span><input name={nombre} type={tipo} value={form[nombre] ?? ''} onChange={cambiar} />{errores[nombre] && <small className="error-text">{errores[nombre]}</small>}</label>;
  return <><Navbar /><main className="page narrow"><div className="container"><div className="page-head"><div><span className="eyebrow">VIAJES</span><h1>Editar viaje</h1></div></div>{error && <p className="banner warn">{error}</p>}<form className="card form-card" onSubmit={guardar}><div className="form-grid">{campo('nombre', 'Nombre')}{campo('origen', 'Origen')}{campo('destino', 'Destino')}{campo('fechaInicio', 'Fecha inicial', 'date')}{campo('fechaFin', 'Fecha final', 'date')}{campo('presupuestoEstimado', 'Presupuesto', 'number')}
    <label className="field"><span>Organizador *</span><select name="organizadorId" value={form.organizadorId} onChange={cambiar}>{usuarios.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>)}</select>{errores.organizadorId && <small className="error-text">{errores.organizadorId}</small>}</label>
    <label className="field"><span>Estado</span><select name="estado" value={form.estado} onChange={cambiar}><option value="PLANIFICACION">Planeación</option><option value="EN_CURSO">En curso</option><option value="FINALIZADO">Finalizado</option><option value="CANCELADO">Cancelado</option></select></label>
    <label className="field"><span>Transporte</span><input name="transporte" value={form.transporte ?? ''} onChange={cambiar} /></label><label className="check"><input name="publico" type="checkbox" checked={form.publico} onChange={cambiar} /> Viaje público</label>
  </div><label className="field"><span>Descripción</span><textarea name="descripcion" value={form.descripcion ?? ''} onChange={cambiar} /></label><div className="form-actions"><Link className="button ghost" to={`/admin/viajes/${id}`}>Cancelar</Link><button className="button primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button></div></form></div></main></>;
}
