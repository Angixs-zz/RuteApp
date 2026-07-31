import { useEffect, useState } from 'react';
import ConfirmModal from './ConfirmModal';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

const actividadVacia = {
  id: null,
  viajeId: '',
  lugar: '',
  horario: '',
  descripcion: '',
  responsableId: '',
  costoEstimado: '',
  estado: 'PENDIENTE',
};

export default function AdminActividades() {
  const [actividades, setActividades] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [formularioActividad, setFormularioActividad] = useState(null);
  const [erroresFormulario, setErroresFormulario] = useState({});
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
  });
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [numeroRecarga, setNumeroRecarga] = useState(0);
  const [actividadAEliminar, setActividadAEliminar] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    let componenteActivo = true;

    api
      .get('/viajes', {
        params: {
          page: 0,
          size: 50,
        },
      })
      .then(({ data: datosViajes }) => {
        if (componenteActivo) {
          setViajes(datosViajes?.contenido ?? []);
        }
      });

    return () => {
      componenteActivo = false;
    };
  }, []);

  useEffect(() => {
    let componenteActivo = true;

    api
      .get('/actividades/paginadas', {
        params: {
          page: pagina,
          size: 10,
          busqueda: filtros.busqueda || undefined,
          estado: filtros.estado || undefined,
        },
      })
      .then(({ data: datosActividades }) => {
        if (componenteActivo) {
          setActividades(datosActividades?.contenido ?? []);
          setTotalPaginas(Math.max(datosActividades?.totalPaginas ?? 1, 1));
        }
      })
      .catch(() => {
        if (componenteActivo) {
          setMensajeError('No fue posible cargar las actividades.');
        }
      })
      .finally(() => {
        if (componenteActivo) {
          setCargando(false);
        }
      });

    return () => {
      componenteActivo = false;
    };
  }, [filtros, pagina, numeroRecarga]);

  const cargarResponsables = async (viajeId) => {
    if (!viajeId) {
      setResponsables([]);
      return;
    }

    const [respuestaViaje, respuestaParticipantes] = await Promise.all([
      api.get(`/viajes/${viajeId}`),
      api.get(`/participantes/viaje/${viajeId}`),
    ]);
    const listaResponsables = [
      {
        id: respuestaViaje.data.organizadorId,
        nombre: respuestaViaje.data.organizadorNombre,
      },
      ...(respuestaParticipantes.data ?? []).map((participante) => ({
        id: participante.usuarioId,
        nombre: participante.nombreUsuario,
      })),
    ];

    setResponsables(
      listaResponsables.filter(
        (responsable, indice) =>
          responsable.id &&
          listaResponsables.findIndex(
            (otroResponsable) => otroResponsable.id === responsable.id,
          ) === indice,
      ),
    );
    return listaResponsables[0]?.id;
  };

  const abrirFormularioActividad = async (actividad = actividadVacia) => {
    const viajeId = actividad.viajeId || viajes[0]?.id || '';
    const primerResponsableId = await cargarResponsables(viajeId);

    setFormularioActividad({
      ...actividadVacia,
      ...actividad,
      viajeId,
      horario: actividad.horario?.slice(0, 16) ?? '',
      responsableId: actividad.responsableId || primerResponsableId || '',
    });
    setErroresFormulario({});
  };

  const cambiarViajeFormulario = async (evento) => {
    const viajeId = evento.target.value;
    const primerResponsableId = await cargarResponsables(viajeId);

    setFormularioActividad((formularioActual) => ({
      ...formularioActual,
      viajeId,
      responsableId: primerResponsableId || '',
    }));
  };

  const guardarActividad = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = {};

    if (!formularioActividad.viajeId) {
      nuevosErrores.viajeId = 'Selecciona un viaje.';
    }
    if (!formularioActividad.lugar.trim()) {
      nuevosErrores.lugar = 'El lugar es obligatorio.';
    }
    if (!formularioActividad.horario) {
      nuevosErrores.horario = 'El horario es obligatorio.';
    }
    if (!formularioActividad.responsableId) {
      nuevosErrores.responsableId = 'Selecciona un responsable.';
    }

    setErroresFormulario(nuevosErrores);
    if (Object.keys(nuevosErrores).length) {
      return;
    }

    try {
      const datosActividad = {
        ...formularioActividad,
        viajeId: Number(formularioActividad.viajeId),
        responsableId: Number(formularioActividad.responsableId),
        costoEstimado: Number(formularioActividad.costoEstimado || 0),
      };

      if (formularioActividad.id) {
        await api.put(
          `/actividades/${formularioActividad.id}`,
          datosActividad,
        );
      } else {
        await api.post('/actividades', datosActividad);
      }

      setFormularioActividad(null);
      setCargando(true);
      setNumeroRecarga((numeroActual) => numeroActual + 1);
    } catch (errorSolicitud) {
      setMensajeError(
        errorSolicitud.response?.data?.mensaje ||
          'No fue posible guardar la actividad.',
      );
    }
  };

  const confirmarEliminacionActividad = async () => {
    try {
      await api.delete(`/actividades/${actividadAEliminar.id}`);
      setActividadAEliminar(null);
      setCargando(true);
      setNumeroRecarga((numeroActual) => numeroActual + 1);
    } catch {
      setMensajeError('No fue posible eliminar la actividad.');
    }
  };

  const aplicarFiltros = () => {
    setCargando(true);
    setPagina(0);
    setFiltros({
      busqueda: textoBusqueda.trim(),
      estado: estadoSeleccionado,
    });
    setNumeroRecarga((numeroActual) => numeroActual + 1);
  };

  const irAPagina = (numeroPagina) => {
    setCargando(true);
    setPagina(numeroPagina);
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="eyebrow">CRUD DE ACTIVIDADES</span>
              <h1>Actividades</h1>
              <p className="muted">
                Administra las actividades de todos los viajes.
              </p>
            </div>
            <button
              className="button primary"
              onClick={() => abrirFormularioActividad()}
            >
              ＋ Nueva actividad
            </button>
          </div>

          <section className="filters admin-trip-filters">
            <input
              value={textoBusqueda}
              onChange={(evento) => setTextoBusqueda(evento.target.value)}
              placeholder="Lugar, viaje o responsable"
            />
            <select
              value={estadoSeleccionado}
              onChange={(evento) =>
                setEstadoSeleccionado(evento.target.value)
              }
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PLANEADA">Planeada</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="COMPLETADA">Completada</option>
            </select>
            <button className="button ghost" onClick={aplicarFiltros}>
              Buscar
            </button>
          </section>

          {mensajeError && <p className="banner warn">{mensajeError}</p>}

          {cargando ? (
            <div className="card panel admin-loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Actividad</th>
                    <th>Viaje</th>
                    <th>Horario</th>
                    <th>Responsable</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {actividades.map((actividad) => (
                    <tr key={actividad.id}>
                      <td>
                        <strong>{actividad.lugar}</strong>
                        <br />
                        <span className="muted">
                          $
                          {Number(
                            actividad.costoEstimado || 0,
                          ).toLocaleString('es-MX')}
                        </span>
                      </td>
                      <td>{actividad.nombreViaje}</td>
                      <td>
                        {new Date(actividad.horario).toLocaleString('es-MX')}
                      </td>
                      <td>{actividad.nombreResponsable}</td>
                      <td>
                        <span className="status planning">
                          {actividad.estado}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="button ghost small"
                            onClick={() => abrirFormularioActividad(actividad)}
                          >
                            Editar
                          </button>
                          <button
                            className="button danger small"
                            onClick={() => setActividadAEliminar(actividad)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!actividades.length && (
                    <tr>
                      <td colSpan="6" className="admin-empty">
                        No se encontraron actividades.
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
                disabled={!pagina}
                onClick={() => irAPagina(pagina - 1)}
              >
                ‹
              </button>
              <span className="admin-page-count">
                Página {pagina + 1} de {totalPaginas}
              </span>
              <button
                disabled={pagina + 1 >= totalPaginas}
                onClick={() => irAPagina(pagina + 1)}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </main>

      <div
        className={`modal-backdrop ${formularioActividad ? 'open' : ''}`}
      >
        <div className="modal admin-form-modal">
          <h3>
            {formularioActividad?.id ? 'Editar actividad' : 'Nueva actividad'}
          </h3>
          {formularioActividad && (
            <form onSubmit={guardarActividad}>
              <label className="field">
                <span>Viaje *</span>
                <select
                  value={formularioActividad.viajeId}
                  onChange={cambiarViajeFormulario}
                >
                  <option value="">Selecciona</option>
                  {viajes.map((viaje) => (
                    <option key={viaje.id} value={viaje.id}>
                      {viaje.nombre}
                    </option>
                  ))}
                </select>
                {erroresFormulario.viajeId && (
                  <small className="error-text">
                    {erroresFormulario.viajeId}
                  </small>
                )}
              </label>

              <label className="field">
                <span>Lugar *</span>
                <input
                  value={formularioActividad.lugar}
                  onChange={(evento) =>
                    setFormularioActividad({
                      ...formularioActividad,
                      lugar: evento.target.value,
                    })
                  }
                />
                {erroresFormulario.lugar && (
                  <small className="error-text">
                    {erroresFormulario.lugar}
                  </small>
                )}
              </label>

              <label className="field">
                <span>Horario *</span>
                <input
                  type="datetime-local"
                  value={formularioActividad.horario}
                  onChange={(evento) =>
                    setFormularioActividad({
                      ...formularioActividad,
                      horario: evento.target.value,
                    })
                  }
                />
                {erroresFormulario.horario && (
                  <small className="error-text">
                    {erroresFormulario.horario}
                  </small>
                )}
              </label>

              <label className="field">
                <span>Responsable *</span>
                <select
                  value={formularioActividad.responsableId}
                  onChange={(evento) =>
                    setFormularioActividad({
                      ...formularioActividad,
                      responsableId: evento.target.value,
                    })
                  }
                >
                  {responsables.map((responsable) => (
                    <option key={responsable.id} value={responsable.id}>
                      {responsable.nombre}
                    </option>
                  ))}
                </select>
                {erroresFormulario.responsableId && (
                  <small className="error-text">
                    {erroresFormulario.responsableId}
                  </small>
                )}
              </label>

              <div className="form-grid">
                <label className="field">
                  <span>Costo</span>
                  <input
                    type="number"
                    min="0"
                    value={formularioActividad.costoEstimado}
                    onChange={(evento) =>
                      setFormularioActividad({
                        ...formularioActividad,
                        costoEstimado: evento.target.value,
                      })
                    }
                  />
                </label>

                <label className="field">
                  <span>Estado</span>
                  <select
                    value={formularioActividad.estado}
                    onChange={(evento) =>
                      setFormularioActividad({
                        ...formularioActividad,
                        estado: evento.target.value,
                      })
                    }
                  >
                    <option>PENDIENTE</option>
                    <option>PLANEADA</option>
                    <option>CONFIRMADA</option>
                    <option>COMPLETADA</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Descripción</span>
                <textarea
                  value={formularioActividad.descripcion ?? ''}
                  onChange={(evento) =>
                    setFormularioActividad({
                      ...formularioActividad,
                      descripcion: evento.target.value,
                    })
                  }
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button ghost"
                  onClick={() => setFormularioActividad(null)}
                >
                  Cancelar
                </button>
                <button className="button primary">Guardar</button>
              </div>
            </form>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(actividadAEliminar)}
        title="Eliminar actividad"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        onConfirm={confirmarEliminacionActividad}
        onCancel={() => setActividadAEliminar(null)}
      />
    </>
  );
}
