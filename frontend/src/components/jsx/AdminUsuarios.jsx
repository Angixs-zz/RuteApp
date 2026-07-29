import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

const formatearFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Sin fecha';

export default function AdminUsuarios() {
  const { user } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [rol, setRol] = useState('TODOS');
  const [estado, setEstado] = useState('TODOS');
  const [filtros, setFiltros] = useState({ busqueda: '', rol: 'TODOS', estado: 'TODOS' });
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [solicitud, setSolicitud] = useState(0);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    api.get('/usuarios/paginados', { params: { page: pagina, size: 10, busqueda: filtros.busqueda || undefined, rol: filtros.rol === 'TODOS' ? undefined : filtros.rol, activo: filtros.estado === 'TODOS' ? undefined : filtros.estado === 'ACTIVO' } })
      .then(({ data }) => {
        if (activo) { setUsuarios(data?.contenido ?? []); setTotalPaginas(Math.max(data?.totalPaginas ?? 1, 1)); }
      })
      .catch(() => {
        if (activo) setError('No fue posible cargar los usuarios.');
      })
      .finally(() => {
        if (activo) setLoading(false);
      });
    return () => {
      activo = false;
    };
  }, [filtros, pagina, solicitud]);

  const buscar = () => { setLoading(true); setError(''); setPagina(0); setFiltros({ busqueda: busqueda.trim(), rol, estado }); setSolicitud((valor) => valor + 1); };
  const cambiarPagina = (nuevaPagina) => { setLoading(true); setPagina(nuevaPagina); };

  const eliminarUsuario = async () => {
    if (!usuarioAEliminar) return;
    try {
      await api.delete(`/usuarios/${usuarioAEliminar.id}`);
      setUsuarios((actuales) => actuales.filter((usuario) => usuario.id !== usuarioAEliminar.id));
      setUsuarioAEliminar(null);
    } catch {
      setError('No fue posible eliminar el usuario. Puede tener información relacionada.');
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
              <p className="muted">Consulta cuentas y elimina usuarios del sistema.</p>
            </div>
            <Link className="button primary" to="/admin/usuarios/nuevo">＋ Nuevo usuario</Link>
          </div>

          <section className="filters">
            <input
              aria-label="Buscar usuario"
              placeholder="Buscar nombre o correo"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
            <select aria-label="Filtrar por rol" value={rol} onChange={(event) => setRol(event.target.value)}>
              <option value="TODOS">Todos los roles</option>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="USUARIO">Usuario</option>
              <option value="AGENCIA">Agencia</option>
            </select>
            <select aria-label="Filtrar por estado" value={estado} onChange={(event) => setEstado(event.target.value)}>
              <option value="TODOS">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
            <button className="button ghost" type="button" onClick={buscar}>Buscar</button>
          </section>

          {error && <p className="banner warn">{error}</p>}

          {loading ? (
            <div className="card panel admin-loading"><div className="spinner"></div><p className="muted">Cargando usuarios...</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Usuario</th><th>Rol</th><th>Teléfono</th><th>Registro</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td><strong>{usuario.nombre}</strong><br /><span className="muted">{usuario.correo}</span></td>
                      <td>{usuario.rol}</td>
                      <td>{usuario.telefono || 'Sin teléfono'}</td>
                      <td>{formatearFecha(usuario.fechaCreacion)}</td>
                      <td><span className={`status ${usuario.activo ? 'confirmed' : 'cancelled'}`}>{usuario.activo ? 'Activo' : 'Inactivo'}</span></td>
                      <td>
                        <div className="admin-actions">
                          <Link className="button ghost small" to={`/admin/usuarios/${usuario.id}`}>Ver</Link>
                          <Link className="button ghost small" to={`/admin/usuarios/${usuario.id}/editar`}>Editar</Link>
                          <button
                            className="button danger small"
                            type="button"
                            disabled={usuario.id === user?.id}
                            title={usuario.id === user?.id ? 'No puedes eliminar tu propia cuenta' : undefined}
                            onClick={() => setUsuarioAEliminar(usuario)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {usuarios.length === 0 && <tr><td colSpan="6" className="admin-empty">No se encontraron usuarios.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
          {!loading && totalPaginas > 1 && <div className="pagination"><button type="button" disabled={pagina === 0} onClick={() => cambiarPagina(pagina - 1)}>‹</button><span className="admin-page-count">Página {pagina + 1} de {totalPaginas}</span><button type="button" disabled={pagina + 1 >= totalPaginas} onClick={() => cambiarPagina(pagina + 1)}>›</button></div>}
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
