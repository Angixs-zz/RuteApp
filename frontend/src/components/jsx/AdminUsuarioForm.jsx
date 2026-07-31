import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';
import { esTelefonoValido, normalizarTelefono } from '../../utils/telefono';

export default function AdminUsuarioForm() {
  const { id: usuarioId } = useParams();
  const navegar = useNavigate();
  const editando = Boolean(usuarioId);
  const [roles, setRoles] = useState([]);
  const [datosFormulario, setDatosFormulario] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    password: '',
    rolId: '',
    activo: true,
  });
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    let solicitudVigente = true;
    Promise.all([
      api.get('/roles'),
      ...(editando ? [api.get(`/usuarios/${usuarioId}`)] : []),
    ])
      .then(([rolesRespuesta, usuarioRespuesta]) => {
        if (!solicitudVigente) return;

        const rolesDisponibles = rolesRespuesta.data ?? [];
        setRoles(rolesDisponibles);

        if (usuarioRespuesta) {
          const usuarioCargado = usuarioRespuesta.data;
          setDatosFormulario({
            nombre: usuarioCargado.nombre ?? '',
            correo: usuarioCargado.correo ?? '',
            telefono: usuarioCargado.telefono ?? '',
            password: '',
            rolId:
              rolesDisponibles.find(
                (rol) => rol.nombre === usuarioCargado.rol,
              )?.id ?? '',
            activo: usuarioCargado.activo,
          });
        } else if (rolesDisponibles.length) {
          setDatosFormulario((datosFormularioActuales) => ({
            ...datosFormularioActuales,
            rolId:
              rolesDisponibles.find((rol) => rol.nombre === 'USUARIO')?.id ??
              rolesDisponibles[0].id,
          }));
        }
      })
      .catch(() => {
        if (solicitudVigente) {
          setMensajeError('No fue posible cargar el formulario.');
        }
      });

    return () => {
      solicitudVigente = false;
    };
  }, [editando, usuarioId]);

  const actualizarCampoFormulario = (eventoCambioCampo) => {
    const { name, value, type, checked } = eventoCambioCampo.target;
    setDatosFormulario((datosFormularioActuales) => ({
      ...datosFormularioActuales,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErroresValidacion((erroresActuales) => ({
      ...erroresActuales,
      [name]: '',
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!datosFormulario.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio.';
    }
    if (!/^\S+@\S+\.\S+$/.test(datosFormulario.correo)) {
      nuevosErrores.correo = 'Ingresa un correo válido.';
    }
    if (
      (!editando || datosFormulario.password) &&
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(
        datosFormulario.password,
      )
    ) {
      nuevosErrores.password =
        'Usa 8 caracteres, una mayúscula, un número y un carácter especial.';
    }
    if (!esTelefonoValido(normalizarTelefono(datosFormulario.telefono))) {
      nuevosErrores.telefono =
        'Usa 10 dígitos mexicanos o formato internacional.';
    }
    if (!datosFormulario.rolId) {
      nuevosErrores.rolId = 'Selecciona un rol.';
    }

    setErroresValidacion(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarUsuario = async (eventoEnvioFormulario) => {
    eventoEnvioFormulario.preventDefault();
    if (!validarFormulario()) return;

    setGuardando(true);
    setMensajeError('');
    const datosUsuario = {
      ...datosFormulario,
      telefono: normalizarTelefono(datosFormulario.telefono),
      rolId: Number(datosFormulario.rolId),
      password: datosFormulario.password || undefined,
    };

    try {
      if (editando) {
        await api.put(`/usuarios/${usuarioId}/admin`, datosUsuario);
      } else {
        await api.post('/usuarios/admin', datosUsuario);
      }
      navegar('/admin/usuarios');
    } catch (errorSolicitud) {
      setMensajeError(
        errorSolicitud.response?.data?.mensaje ||
          'No fue posible guardar el usuario.',
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page narrow">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="eyebrow">USUARIOS</span>
              <h1>{editando ? 'Editar usuario' : 'Nuevo usuario'}</h1>
            </div>
          </div>
          {mensajeError && <p className="banner warn">{mensajeError}</p>}
          <form className="card form-card" onSubmit={guardarUsuario}>
            <div className="form-grid">
              <label className="field">
                <span>Nombre *</span>
                <input
                  name="nombre"
                  value={datosFormulario.nombre}
                  onChange={actualizarCampoFormulario}
                />
                {erroresValidacion.nombre && (
                  <small className="error-text">
                    {erroresValidacion.nombre}
                  </small>
                )}
              </label>
              <label className="field">
                <span>Correo *</span>
                <input
                  name="correo"
                  type="email"
                  value={datosFormulario.correo}
                  onChange={actualizarCampoFormulario}
                />
                {erroresValidacion.correo && (
                  <small className="error-text">
                    {erroresValidacion.correo}
                  </small>
                )}
              </label>
              <label className="field">
                <span>Teléfono</span>
                <input
                  name="telefono"
                  value={datosFormulario.telefono}
                  onChange={actualizarCampoFormulario}
                  placeholder="+5219511168398"
                />
                {erroresValidacion.telefono && (
                  <small className="error-text">
                    {erroresValidacion.telefono}
                  </small>
                )}
              </label>
              <label className="field">
                <span>
                  {editando
                    ? 'Nueva contraseña (opcional)'
                    : 'Contraseña *'}
                </span>
                <input
                  name="password"
                  type="password"
                  value={datosFormulario.password}
                  onChange={actualizarCampoFormulario}
                />
                {erroresValidacion.password && (
                  <small className="error-text">
                    {erroresValidacion.password}
                  </small>
                )}
              </label>
              <label className="field">
                <span>Rol *</span>
                <select
                  name="rolId"
                  value={datosFormulario.rolId}
                  onChange={actualizarCampoFormulario}
                >
                  <option value="">Selecciona</option>
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
                {erroresValidacion.rolId && (
                  <small className="error-text">
                    {erroresValidacion.rolId}
                  </small>
                )}
              </label>
              {editando && (
                <label className="check">
                  <input
                    name="activo"
                    type="checkbox"
                    checked={datosFormulario.activo}
                    onChange={actualizarCampoFormulario}
                  />{' '}
                  Cuenta activa
                </label>
              )}
            </div>
            <div className="form-actions">
              <Link className="button ghost" to="/admin/usuarios">
                Cancelar
              </Link>
              <button className="button primary" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
