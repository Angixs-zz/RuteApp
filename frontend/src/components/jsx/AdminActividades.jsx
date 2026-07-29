import { useEffect, useState } from 'react';
import ConfirmModal from './ConfirmModal';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

const vacia = { id: null, viajeId: '', lugar: '', horario: '', descripcion: '', responsableId: '', costoEstimado: '', estado: 'PENDIENTE' };

export default function AdminActividades() {
  const [actividades, setActividades] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [form, setForm] = useState(null);
  const [errores, setErrores] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [filtros, setFiltros] = useState({ busqueda: '', estado: '' });
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [solicitud, setSolicitud] = useState(0);
  const [eliminar, setEliminar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { let activo = true; api.get('/viajes', { params: { page: 0, size: 50 } }).then(({ data }) => { if (activo) setViajes(data?.contenido ?? []); }); return () => { activo = false; }; }, []);
  useEffect(() => { let activo = true; api.get('/actividades/paginadas', { params: { page: pagina, size: 10, busqueda: filtros.busqueda || undefined, estado: filtros.estado || undefined } }).then(({ data }) => { if (activo) { setActividades(data?.contenido ?? []); setTotalPaginas(Math.max(data?.totalPaginas ?? 1, 1)); } }).catch(() => { if (activo) setError('No fue posible cargar las actividades.'); }).finally(() => { if (activo) setLoading(false); }); return () => { activo = false; }; }, [filtros, pagina, solicitud]);

  const cargarResponsables = async (viajeId) => {
    if (!viajeId) { setResponsables([]); return; }
    const [viaje, participantes] = await Promise.all([api.get(`/viajes/${viajeId}`), api.get(`/participantes/viaje/${viajeId}`)]);
    const lista = [{ id: viaje.data.organizadorId, nombre: viaje.data.organizadorNombre }, ...(participantes.data ?? []).map((p) => ({ id: p.usuarioId, nombre: p.nombreUsuario }))];
    setResponsables(lista.filter((item, indice) => item.id && lista.findIndex((otro) => otro.id === item.id) === indice));
    return lista[0]?.id;
  };
  const abrir = async (actividad = vacia) => { const viajeId = actividad.viajeId || viajes[0]?.id || ''; const primero = await cargarResponsables(viajeId); setForm({ ...vacia, ...actividad, viajeId, horario: actividad.horario?.slice(0, 16) ?? '', responsableId: actividad.responsableId || primero || '' }); setErrores({}); };
  const cambiarViaje = async (event) => { const viajeId = event.target.value; const primero = await cargarResponsables(viajeId); setForm((actual) => ({ ...actual, viajeId, responsableId: primero || '' })); };
  const guardar = async (event) => { event.preventDefault(); const nuevos = {}; if (!form.viajeId) nuevos.viajeId = 'Selecciona un viaje.'; if (!form.lugar.trim()) nuevos.lugar = 'El lugar es obligatorio.'; if (!form.horario) nuevos.horario = 'El horario es obligatorio.'; if (!form.responsableId) nuevos.responsableId = 'Selecciona un responsable.'; setErrores(nuevos); if (Object.keys(nuevos).length) return; try { const payload = { ...form, viajeId: Number(form.viajeId), responsableId: Number(form.responsableId), costoEstimado: Number(form.costoEstimado || 0) }; if (form.id) await api.put(`/actividades/${form.id}`, payload); else await api.post('/actividades', payload); setForm(null); setLoading(true); setSolicitud((valor) => valor + 1); } catch (err) { setError(err.response?.data?.mensaje || 'No fue posible guardar la actividad.'); } };
  const confirmarEliminar = async () => { try { await api.delete(`/actividades/${eliminar.id}`); setEliminar(null); setLoading(true); setSolicitud((valor) => valor + 1); } catch { setError('No fue posible eliminar la actividad.'); } };
  const buscar = () => { setLoading(true); setPagina(0); setFiltros({ busqueda: busqueda.trim(), estado }); setSolicitud((valor) => valor + 1); };
  const cambiarPagina = (valor) => { setLoading(true); setPagina(valor); };

  return <><Navbar /><main className="page"><div className="container"><div className="page-head"><div><span className="eyebrow">CRUD DE ACTIVIDADES</span><h1>Actividades</h1><p className="muted">Administra las actividades de todos los viajes.</p></div><button className="button primary" onClick={() => abrir()}>＋ Nueva actividad</button></div><section className="filters admin-trip-filters"><input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Lugar, viaje o responsable" /><select value={estado} onChange={(e) => setEstado(e.target.value)}><option value="">Todos los estados</option><option value="PENDIENTE">Pendiente</option><option value="PLANEADA">Planeada</option><option value="CONFIRMADA">Confirmada</option><option value="COMPLETADA">Completada</option></select><button className="button ghost" onClick={buscar}>Buscar</button></section>{error && <p className="banner warn">{error}</p>}{loading ? <div className="card panel admin-loading"><div className="spinner"></div></div> : <div className="table-wrap"><table><thead><tr><th>Actividad</th><th>Viaje</th><th>Horario</th><th>Responsable</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{actividades.map((a) => <tr key={a.id}><td><strong>{a.lugar}</strong><br /><span className="muted">${Number(a.costoEstimado || 0).toLocaleString('es-MX')}</span></td><td>{a.nombreViaje}</td><td>{new Date(a.horario).toLocaleString('es-MX')}</td><td>{a.nombreResponsable}</td><td><span className="status planning">{a.estado}</span></td><td><div className="admin-actions"><button className="button ghost small" onClick={() => abrir(a)}>Editar</button><button className="button danger small" onClick={() => setEliminar(a)}>Eliminar</button></div></td></tr>)}{!actividades.length && <tr><td colSpan="6" className="admin-empty">No se encontraron actividades.</td></tr>}</tbody></table></div>}{!loading && totalPaginas > 1 && <div className="pagination"><button disabled={!pagina} onClick={() => cambiarPagina(pagina - 1)}>‹</button><span className="admin-page-count">Página {pagina + 1} de {totalPaginas}</span><button disabled={pagina + 1 >= totalPaginas} onClick={() => cambiarPagina(pagina + 1)}>›</button></div>}</div></main>
  <div className={`modal-backdrop ${form ? 'open' : ''}`}><div className="modal admin-form-modal"><h3>{form?.id ? 'Editar actividad' : 'Nueva actividad'}</h3>{form && <form onSubmit={guardar}><label className="field"><span>Viaje *</span><select value={form.viajeId} onChange={cambiarViaje}><option value="">Selecciona</option>{viajes.map((v) => <option key={v.id} value={v.id}>{v.nombre}</option>)}</select>{errores.viajeId && <small className="error-text">{errores.viajeId}</small>}</label><label className="field"><span>Lugar *</span><input value={form.lugar} onChange={(e) => setForm({ ...form, lugar: e.target.value })} />{errores.lugar && <small className="error-text">{errores.lugar}</small>}</label><label className="field"><span>Horario *</span><input type="datetime-local" value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} />{errores.horario && <small className="error-text">{errores.horario}</small>}</label><label className="field"><span>Responsable *</span><select value={form.responsableId} onChange={(e) => setForm({ ...form, responsableId: e.target.value })}>{responsables.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}</select>{errores.responsableId && <small className="error-text">{errores.responsableId}</small>}</label><div className="form-grid"><label className="field"><span>Costo</span><input type="number" min="0" value={form.costoEstimado} onChange={(e) => setForm({ ...form, costoEstimado: e.target.value })} /></label><label className="field"><span>Estado</span><select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}><option>PENDIENTE</option><option>PLANEADA</option><option>CONFIRMADA</option><option>COMPLETADA</option></select></label></div><label className="field"><span>Descripción</span><textarea value={form.descripcion ?? ''} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></label><div className="modal-actions"><button type="button" className="button ghost" onClick={() => setForm(null)}>Cancelar</button><button className="button primary">Guardar</button></div></form>}</div></div><ConfirmModal isOpen={Boolean(eliminar)} title="Eliminar actividad" message="Esta acción no se puede deshacer." confirmText="Eliminar" onConfirm={confirmarEliminar} onCancel={() => setEliminar(null)} /></>;
}
