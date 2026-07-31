import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

const formatearFecha = (fechaSinFormato) =>
  fechaSinFormato
    ? new Date(fechaSinFormato).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Sin fecha';

export default function AdminUsuarios() {
  const { user: usuarioAutenticado } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [rolSeleccionado, setRolSeleccionado] = useState('TODOS');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('TODOS');
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    busqueda: '',
    rol: 'TODOS',
    estado: 'TODOS',
  });
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [numeroSolicitud, setNumeroSolicitud] = useState(0);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    let solicitudVigente = true;

    api
      .get('/usuarios/paginados', {
        params: {
          page: paginaActual,
          size: 10,
          busqueda: filtrosAplicados.busqueda || undefined,
          rol:
            filtrosAplicados.rol === 'TODOS'
              ? undefined
              : filtrosAplicados.rol,
          activo:
            filtrosAplicados.estado === 'TODOS'
              ? undefined
              : filtrosAplicados.estado === 'ACTIVO',
        },
      })
      .then(({ data: respuestaPaginada }) => {
        if (solicitudVigente) {
          setUsuarios(respuestaPaginada?.contenido ?? []);
          setTotalPaginas(
            Math.max(respuestaPaginada?.totalPaginas ?? 1, 1),
          );
        }
      })
      .catch(() => {
        if (solicitudVigente) {
          setMensajeError('No fue posible cargar los usuarios.');
        }
      })
      .finally(() => {
        if (solicitudVigente) {
          setCargando(false);
        }
      });

    return () => {
      solicitudVigente = false;
    };
  }, [filtrosAplicados, paginaActual, numeroSolicitud]);

  const aplicarFiltros = () => {
    setCargando(true);
    setMensajeError('');
    setPaginaActual(0);
    setFiltrosAplicados({
      busqueda: busqueda.trim(),
      rol: rolSeleccionado,
      estado: estadoSeleccionado,
    });
    setNumeroSolicitud((numeroSolicitudActual) => numeroSolicitudActual + 1);
  };

  const cambiarPagina = (nuevaPagina) => {
    setCargando(true);
    setPaginaActual(nuevaPagina);
  };

  const eliminarUsuario = async () => {
    if (!usuarioAEliminar) {
      return;
    }

    try {
      await api.delete(`/usuarios/${usuarioAEliminar.id}`);
      setUsuarios((usuariosActuales) =>
        usuariosActuales.filter(
          (usuario) => usuario.id !== usuarioAEliminar.id,
        ),
      );
      setUsuarioAEliminar(null);
    } catch {
      setMensajeError(
        'No fue posible eliminar el usuario. Puede tener información relacionada.',
      );
      setUsuarioAEliminar(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="eyebrow">ADMINISTRACIÓN DE USUARIOS</span>
              <h1>Usuarios</h1>
              <p className="muted">
                Consulta cuentas y elimina usuarios del sistema.
              </p>
            </div>
            <Link className="button primary" to="/admin/usuarios/nuevo">
              ＋ Nuevo usuario
            </Link>
          </div>

          <section className="filters">
            <input
              aria-label="Buscar usuario"
              placeholder="Buscar nombre o correo"
              value={busqueda}
              onChange={(eventoCambioBusqueda) =>
                setBusqueda(eventoCambioBusqueda.target.value)
              }
            />
            <select
              aria-label="Filtrar por rol"
              value={rolSeleccionado}
              onChange={(eventoCambioRol) =>
                setRolSeleccionado(eventoCambioRol.target.value)
              }
            >
              <option value="TODOS">Todos los roles</option>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="USUARIO">Usuario</option>
              <option value="AGENCIA">Agencia</option>
            </select>
            <select
              aria-label="Filtrar por estado"
              value={estadoSeleccionado}
              onChange={(eventoCambioEstado) =>
                setEstadoSeleccionado(eventoCambioEstado.target.value)
              }
            >
              <option value="TODOS">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
            <button
              className="button ghost"
              type="button"
              onClick={aplicarFiltros}
            >
              Buscar
            </button>
          </section>

          {mensajeError && <p className="banner warn">{mensajeError}</p>}

          {cargando ? (
            <div className="card panel admin-loading">
              <div className="spinner"></div>
              <p className="muted">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Teléfono</th>
                    <th>Registro</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>
                        <strong>{usuario.nombre}</strong>
                        <br />
                        <span className="muted">{usuario.correo}</span>
                      </td>
                      <td>{usuario.rol}</td>
                      <td>{usuario.telefono || 'Sin teléfono'}</td>
                      <td>{formatearFecha(usuario.fechaCreacion)}</td>
                      <td>
                        <span
                          className={`status ${usuario.activo ? 'confirmed' : 'cancelled'}`}
                        >
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <Link
                            className="button ghost small"
                            to={`/admin/usuarios/${usuario.id}`}
                          >
                            Ver
                          </Link>
                          <Link
                            className="button ghost small"
                            to={`/admin/usuarios/${usuario.id}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="button danger small"
                            type="button"
                            disabled={usuario.id === usuarioAutenticado?.id}
                            title={
                              usuario.id === usuarioAutenticado?.id
                                ? 'No puedes eliminar tu propia cuenta'
                                : undefined
                            }
                            onClick={() => setUsuarioAEliminar(usuario)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {usuarios.length === 0 && (
                    <tr>
                      <td colSpan="6" className="admin-empty">
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!cargando && totalPaginas > 1 && (
            <div className="pagination">
              <button
                type="button"
                disabled={paginaActual === 0}
                onClick={() => cambiarPagina(paginaActual - 1)}
              >
                ‹
              </button>
              <span className="admin-page-count">
                Página {paginaActual + 1} de {totalPaginas}
              </span>
              <button
                type="button"
                disabled={paginaActual + 1 >= totalPaginas}
                onClick={() => cambiarPagina(paginaActual + 1)}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </main>
      <ConfirmModal
        isOpen={Boolean(usuarioAEliminar)}
        title="Eliminar usuario"
        message={`¿Deseas eliminar a ${usuarioAEliminar?.nombre ?? 'este usuario'}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        onConfirm={eliminarUsuario}
        onCancel={() => setUsuarioAEliminar(null)}
      />
    </>
  );
}
