import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

export default function AdminUsuarioDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [usuario, setUsuario] = useState(null);
  const [viajesCreados, setViajesCreados] = useState(0);
  const [participaciones, setParticipaciones] = useState(0);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    Promise.allSettled([
      api.get(`/usuarios/${id}`),
      api.get(`/viajes/organizador/${id}`),
      api.get('/participantes'),
    ]).then(([usuarioResultado, viajesResultado, participantesResultado]) => {
      if (!activo) return;
      if (usuarioResultado.status === 'rejected') {
        setError('No fue posible cargar el usuario.');
      } else {
        setUsuario(usuarioResultado.value.data);
      }
      if (viajesResultado.status === 'fulfilled') {
        setViajesCreados(Array.isArray(viajesResultado.value.data) ? viajesResultado.value.data.length : 0);
      }
      if (participantesResultado.status === 'fulfilled') {
        const participantes = Array.isArray(participantesResultado.value.data) ? participantesResultado.value.data : [];
        setParticipaciones(participantes.filter((participante) => String(participante.usuarioId) === String(id)).length);
      }
      setLoading(false);
    });
    return () => {
      activo = false;
    };
  }, [id]);

  const eliminarUsuario = async () => {
    try {
      await api.delete(`/usuarios/${id}`);
      navigate('/admin/usuarios', { replace: true });
    } catch {
      setError('No fue posible eliminar el usuario. Puede tener información relacionada.');
      setConfirmarEliminar(false);
    }
  };

  const fechaRegistro = usuario?.fechaCreacion
    ? new Date(usuario.fechaCreacion).toLocaleDateString('es-MX', { dateStyle: 'long' })
    : 'Sin fecha';

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="eyebrow">DETALLE DE USUARIO</span>
              <h1>{usuario?.nombre || 'Usuario'}</h1>
              <p className="muted">Información de cuenta y relaciones registradas.</p>
            </div>
            <div className="form-actions admin-page-actions">
              <Link className="button ghost" to="/admin/usuarios">Volver</Link>
              <Link className="button ghost" to={`/admin/usuarios/${id}/editar`}>Editar</Link>
              <button className="button danger" type="button" disabled={Number(id) === user?.id} onClick={() => setConfirmarEliminar(true)}>Eliminar</button>
            </div>
          </div>

          {error && <p className="banner warn">{error}</p>}
          {loading ? (
            <div className="card panel admin-loading"><div className="spinner"></div><p className="muted">Cargando usuario...</p></div>
          ) : usuario && (
            <div className="profile-layout">
              <aside className="card profile-card">
                <img className="avatar" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombre)}&background=0E7C7B&color=fff`} alt="Avatar" />
                <h2>{usuario.nombre}</h2>
                <p className="muted">{usuario.correo}</p>
                <span className={`status ${usuario.activo ? 'confirmed' : 'cancelled'}`}>{usuario.activo ? 'Cuenta activa' : 'Cuenta inactiva'}</span>
              </aside>
              <section className="card form-card">
                <div className="info-grid">
                  <div className="info-item"><span>Rol</span><strong>{usuario.rol}</strong></div>
                  <div className="info-item"><span>Registro</span><strong>{fechaRegistro}</strong></div>
                  <div className="info-item"><span>Teléfono</span><strong>{usuario.telefono || 'Sin teléfono'}</strong></div>
                  <div className="info-item"><span>Viajes creados</span><strong>{viajesCreados}</strong></div>
                  <div className="info-item"><span>Participaciones</span><strong>{participaciones}</strong></div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
      <ConfirmModal
        isOpen={confirmarEliminar}
        title="Eliminar usuario"
        message={`¿Deseas eliminar a ${usuario?.nombre ?? 'este usuario'}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        onConfirm={eliminarUsuario}
        onCancel={() => setConfirmarEliminar(false)}
      />
    </>
  );
}
