import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

export default function AdminViajeForm() {
  const { id: viajeId } = useParams();
  const navegar = useNavigate();
  const [datosFormulario, setDatosFormulario] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let solicitudActiva = true;
    Promise.all([
      api.get(`/viajes/${viajeId}`),
      api.get('/usuarios/paginados', {
        params: { page: 0, size: 50, activo: true },
      }),
    ])
      .then(([respuestaViaje, respuestaUsuarios]) => {
        if (!solicitudActiva) return;

        setDatosFormulario(respuestaViaje.data);
        setUsuarios(respuestaUsuarios.data?.contenido ?? []);
      })
      .catch(() => {
        if (solicitudActiva) setError('No fue posible cargar el viaje.');
      });

    return () => {
      solicitudActiva = false;
    };
  }, [viajeId]);

  const actualizarCampo = (eventoCambio) => {
    const {
      name: nombreCampo,
      value: valorCampo,
      type: tipoCampo,
      checked: marcado,
    } = eventoCambio.target;
    setDatosFormulario((formularioActual) => ({
      ...formularioActual,
      [nombreCampo]: tipoCampo === 'checkbox' ? marcado : valorCampo,
    }));
    setErrores((erroresActuales) => ({
      ...erroresActuales,
      [nombreCampo]: '',
    }));
  };

  const guardarViaje = async (eventoFormulario) => {
    eventoFormulario.preventDefault();
    const nuevosErrores = {};

    [
      'nombre',
      'origen',
      'destino',
      'fechaInicio',
      'fechaFin',
      'organizadorId',
    ].forEach((nombreCampo) => {
      if (!datosFormulario[nombreCampo]) {
        nuevosErrores[nombreCampo] = 'Este campo es obligatorio.';
      }
    });
    if (
      datosFormulario.fechaFin &&
      datosFormulario.fechaInicio &&
      datosFormulario.fechaFin < datosFormulario.fechaInicio
    ) {
      nuevosErrores.fechaFin = 'La fecha final no puede ser anterior.';
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length) return;

    setGuardando(true);
    setError('');

    try {
      await api.put(`/viajes/${viajeId}`, {
        ...datosFormulario,
        organizadorId: Number(datosFormulario.organizadorId),
        presupuestoEstimado: Number(
          datosFormulario.presupuestoEstimado || 0,
        ),
      });
      navegar(`/admin/viajes/${viajeId}`);
    } catch (errorSolicitud) {
      setError(
        errorSolicitud.response?.data?.mensaje ||
          'No fue posible guardar el viaje.',
      );
    } finally {
      setGuardando(false);
    }
  };

  if (!datosFormulario) {
    return (
      <>
        <Navbar />
        <main className="page">
          <div className="container">
            <div className="card panel admin-loading">
              <div className="spinner"></div>
              <p>{error || 'Cargando viaje...'}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  const renderizarCampo = (
    nombreCampo,
    etiquetaCampo,
    tipoCampo = 'text',
  ) => (
    <label className="field">
      <span>{etiquetaCampo} *</span>
      <input
        name={nombreCampo}
        type={tipoCampo}
        value={datosFormulario[nombreCampo] ?? ''}
        onChange={actualizarCampo}
      />
      {errores[nombreCampo] && (
        <small className="error-text">{errores[nombreCampo]}</small>
      )}
    </label>
  );

  return (
    <>
      <Navbar />
      <main className="page narrow">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="eyebrow">VIAJES</span>
              <h1>Editar viaje</h1>
            </div>
          </div>
          {error && <p className="banner warn">{error}</p>}
          <form className="card form-card" onSubmit={guardarViaje}>
            <div className="form-grid">
              {renderizarCampo('nombre', 'Nombre')}
              {renderizarCampo('origen', 'Origen')}
              {renderizarCampo('destino', 'Destino')}
              {renderizarCampo('fechaInicio', 'Fecha inicial', 'date')}
              {renderizarCampo('fechaFin', 'Fecha final', 'date')}
              {renderizarCampo('presupuestoEstimado', 'Presupuesto', 'number')}
              <label className="field">
                <span>Organizador *</span>
                <select
                  name="organizadorId"
                  value={datosFormulario.organizadorId}
                  onChange={actualizarCampo}
                >
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre}
                    </option>
                  ))}
                </select>
                {errores.organizadorId && (
                  <small className="error-text">
                    {errores.organizadorId}
                  </small>
                )}
              </label>
              <label className="field">
                <span>Estado</span>
                <select
                  name="estado"
                  value={datosFormulario.estado}
                  onChange={actualizarCampo}
                >
                  <option value="PLANIFICACION">Planeación</option>
                  <option value="EN_CURSO">En curso</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </label>
              <label className="field">
                <span>Transporte</span>
                <input
                  name="transporte"
                  value={datosFormulario.transporte ?? ''}
                  onChange={actualizarCampo}
                />
              </label>
              <label className="check">
                <input
                  name="publico"
                  type="checkbox"
                  checked={datosFormulario.publico}
                  onChange={actualizarCampo}
                />{' '}
                Viaje público
              </label>
            </div>
            <label className="field">
              <span>Descripción</span>
              <textarea
                name="descripcion"
                value={datosFormulario.descripcion ?? ''}
                onChange={actualizarCampo}
              />
            </label>
            <div className="form-actions">
              <Link className="button ghost" to={`/admin/viajes/${viajeId}`}>
                Cancelar
              </Link>
              <button className="button primary" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
