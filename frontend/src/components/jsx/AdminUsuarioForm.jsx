import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';
import { esTelefonoValido, normalizarTelefono } from '../../utils/telefono';

export default function AdminUsuarioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editando = Boolean(id);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', password: '', rolId: '', activo: true });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    Promise.all([api.get('/roles'), ...(editando ? [api.get(`/usuarios/${id}`)] : [])]).then(([rolesRespuesta, usuarioRespuesta]) => {
      if (!activo) return;
      const rolesData = rolesRespuesta.data ?? [];
      setRoles(rolesData);
      if (usuarioRespuesta) {
        const usuario = usuarioRespuesta.data;
        setForm({ nombre: usuario.nombre ?? '', correo: usuario.correo ?? '', telefono: usuario.telefono ?? '', password: '', rolId: rolesData.find((rol) => rol.nombre === usuario.rol)?.id ?? '', activo: usuario.activo });
      } else if (rolesData.length) setForm((actual) => ({ ...actual, rolId: rolesData.find((rol) => rol.nombre === 'USUARIO')?.id ?? rolesData[0].id }));
    }).catch(() => { if (activo) setError('No fue posible cargar el formulario.'); });
    return () => { activo = false; };
  }, [editando, id]);

  const cambiar = (event) => { const { name, value, type, checked } = event.target; setForm((actual) => ({ ...actual, [name]: type === 'checkbox' ? checked : value })); setErrores((actual) => ({ ...actual, [name]: '' })); };
  const validar = () => {
    const nuevos = {};
    if (!form.nombre.trim()) nuevos.nombre = 'El nombre es obligatorio.';
    if (!/^\S+@\S+\.\S+$/.test(form.correo)) nuevos.correo = 'Ingresa un correo válido.';
    if ((!editando || form.password) && !/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password)) nuevos.password = 'Usa 8 caracteres, una mayúscula, un número y un carácter especial.';
    if (!esTelefonoValido(normalizarTelefono(form.telefono))) nuevos.telefono = 'Usa 10 dígitos mexicanos o formato internacional.';
    if (!form.rolId) nuevos.rolId = 'Selecciona un rol.';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };
  const guardar = async (event) => {
    event.preventDefault();
    if (!validar()) return;
    setGuardando(true); setError('');
    const payload = { ...form, telefono: normalizarTelefono(form.telefono), rolId: Number(form.rolId), password: form.password || undefined };
    try { if (editando) await api.put(`/usuarios/${id}/admin`, payload); else await api.post('/usuarios/admin', payload); navigate('/admin/usuarios'); }
    catch (err) { setError(err.response?.data?.mensaje || 'No fue posible guardar el usuario.'); }
    finally { setGuardando(false); }
  };

  return <><Navbar /><main className="page narrow"><div className="container"><div className="page-head"><div><span className="eyebrow">USUARIOS</span><h1>{editando ? 'Editar usuario' : 'Nuevo usuario'}</h1></div></div>{error && <p className="banner warn">{error}</p>}<form className="card form-card" onSubmit={guardar}><div className="form-grid">
    <label className="field"><span>Nombre *</span><input name="nombre" value={form.nombre} onChange={cambiar} />{errores.nombre && <small className="error-text">{errores.nombre}</small>}</label>
    <label className="field"><span>Correo *</span><input name="correo" type="email" value={form.correo} onChange={cambiar} />{errores.correo && <small className="error-text">{errores.correo}</small>}</label>
    <label className="field"><span>Teléfono</span><input name="telefono" value={form.telefono} onChange={cambiar} placeholder="+5219511168398" />{errores.telefono && <small className="error-text">{errores.telefono}</small>}</label>
    <label className="field"><span>{editando ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</span><input name="password" type="password" value={form.password} onChange={cambiar} />{errores.password && <small className="error-text">{errores.password}</small>}</label>
    <label className="field"><span>Rol *</span><select name="rolId" value={form.rolId} onChange={cambiar}><option value="">Selecciona</option>{roles.map((rol) => <option key={rol.id} value={rol.id}>{rol.nombre}</option>)}</select>{errores.rolId && <small className="error-text">{errores.rolId}</small>}</label>
    {editando && <label className="check"><input name="activo" type="checkbox" checked={form.activo} onChange={cambiar} /> Cuenta activa</label>}
  </div><div className="form-actions"><Link className="button ghost" to="/admin/usuarios">Cancelar</Link><button className="button primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button></div></form></div></main></>;
}
