import { useEffect, useState } from 'react';
import ConfirmModal from './ConfirmModal';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

const gastoVacio = {
  id: null,
  viajeId: '',
  pagadorId: '',
  concepto: '',
  monto: '',
  categoria: 'OTRO',
  fecha: '',
};

export default function AdminGastos() {
  const [gastos, setGastos] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [formularioGasto, setFormularioGasto] = useState(null);
  const [erroresFormulario, setErroresFormulario] = useState({});
  const [gastoAEliminar, setGastoAEliminar] = useState(null);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [filtros, setFiltros] = useState({ busqueda: '', categoria: '' });
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [numeroRecarga, setNumeroRecarga] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    let componenteActivo = true;

    Promise.all([
      api.get('/viajes', { params: { page: 0, size: 50 } }),
      api.get('/usuarios/paginados', {
        params: { page: 0, size: 50, activo: true },
      }),
    ]).then(([respuestaViajes, respuestaUsuarios]) => {
      if (componenteActivo) {
        setViajes(respuestaViajes.data?.contenido ?? []);
        setUsuarios(respuestaUsuarios.data?.contenido ?? []);
      }
    });

    return () => {
      componenteActivo = false;
    };
  }, []);

  useEffect(() => {
    let componenteActivo = true;

    api
      .get('/gastos/paginados', {
        params: {
          page: pagina,
          size: 10,
          busqueda: filtros.busqueda || undefined,
          categoria: filtros.categoria || undefined,
        },
      })
      .then(({ data: datosGastos }) => {
        if (componenteActivo) {
          setGastos(datosGastos?.contenido ?? []);
          setTotalPaginas(Math.max(datosGastos?.totalPaginas ?? 1, 1));
        }
      })
      .catch(() => {
        if (componenteActivo)
          setMensajeError('No fue posible cargar los gastos.');
      })
      .finally(() => {
        if (componenteActivo) setCargando(false);
      });

    return () => {
      componenteActivo = false;
    };
  }, [filtros, pagina, numeroRecarga]);

  const abrirFormularioGasto = (gasto = gastoVacio) =>
    setFormularioGasto({
      ...gastoVacio,
      ...gasto,
      viajeId: gasto.viajeId || viajes[0]?.id || '',
      pagadorId: gasto.pagadorId || usuarios[0]?.id || '',
      fecha: gasto.fecha || new Date().toISOString().slice(0, 10),
    });

  const guardarGasto = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = {};

    if (!formularioGasto.viajeId)
      nuevosErrores.viajeId = 'Selecciona un viaje.';
    if (!formularioGasto.pagadorId)
      nuevosErrores.pagadorId = 'Selecciona un pagador.';
    if (!formularioGasto.concepto.trim())
      nuevosErrores.concepto = 'El concepto es obligatorio.';
    if (!(Number(formularioGasto.monto) > 0))
      nuevosErrores.monto = 'El monto debe ser mayor a 0.';
    if (!formularioGasto.fecha)
      nuevosErrores.fecha = 'La fecha es obligatoria.';

    setErroresFormulario(nuevosErrores);
    if (Object.keys(nuevosErrores).length) return;

    try {
      const datosGasto = {
        ...formularioGasto,
        viajeId: Number(formularioGasto.viajeId),
        pagadorId: Number(formularioGasto.pagadorId),
        monto: Number(formularioGasto.monto),
      };

      if (formularioGasto.id)
        await api.put(`/gastos/${formularioGasto.id}`, datosGasto);
      else await api.post('/gastos', datosGasto);

      setFormularioGasto(null);
      setCargando(true);
      setNumeroRecarga((numeroActual) => numeroActual + 1);
    } catch (errorSolicitud) {
      setMensajeError(
        errorSolicitud.response?.data?.mensaje ||
          'No fue posible guardar el gasto.',
      );
    }
  };

  const confirmarEliminacionGasto = async () => {
    try {
      await api.delete(`/gastos/${gastoAEliminar.id}`);
      setGastoAEliminar(null);
      setCargando(true);
      setNumeroRecarga((numeroActual) => numeroActual + 1);
    } catch {
      setMensajeError('No fue posible eliminar el gasto.');
    }
  };

  const aplicarFiltros = () => {
    setCargando(true);
    setPagina(0);
    setFiltros({
      busqueda: textoBusqueda.trim(),
      categoria: categoriaSeleccionada,
    });
    setNumeroRecarga((numeroActual) => numeroActual + 1);
  };

  const irAPagina = (numeroPagina) => {
    setCargando(true);
    setPagina(numeroPagina);
  };

  const categorias = [
    'TRANSPORTE',
    'HOSPEDAJE',
    'COMIDA',
    'ENTRETENIMIENTO',
    'OTRO',
  ];

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="eyebrow">CRUD DE GASTOS</span>
              <h1>Gastos</h1>
              <p className="muted">
                Administra los gastos de todos los viajes.
              </p>
            </div>
            <button
              className="button primary"
              onClick={() => abrirFormularioGasto()}
            >
              ＋ Nuevo gasto
            </button>
          </div>

          <section className="filters admin-trip-filters">
            <input
              value={textoBusqueda}
              onChange={(evento) => setTextoBusqueda(evento.target.value)}
              placeholder="Concepto, viaje o pagador"
            />
            <select
              value={categoriaSeleccionada}
              onChange={(evento) =>
                setCategoriaSeleccionada(evento.target.value)
              }
            >
              <option value="">Todas las categorías</option>
              {categorias.map((categoriaGasto) => (
                <option key={categoriaGasto}>{categoriaGasto}</option>
              ))}
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
                    <th>Concepto</th>
                    <th>Viaje</th>
                    <th>Pagador</th>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((gasto) => (
                    <tr key={gasto.id}>
                      <td>
                        <strong>{gasto.concepto}</strong>
                        <br />
                        <span className="muted">{gasto.categoria}</span>
                      </td>
                      <td>{gasto.viajeNombre}</td>
                      <td>{gasto.pagadorNombre}</td>
                      <td>
                        {new Date(
                          `${gasto.fecha}T00:00:00`,
                        ).toLocaleDateString('es-MX')}
                      </td>
                      <td>${Number(gasto.monto).toLocaleString('es-MX')}</td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="button ghost small"
                            onClick={() => abrirFormularioGasto(gasto)}
                          >
                            Editar
                          </button>
                          <button
                            className="button danger small"
                            onClick={() => setGastoAEliminar(gasto)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!gastos.length && (
                    <tr>
                      <td colSpan="6" className="admin-empty">
                        No se encontraron gastos.
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

      <div className={`modal-backdrop ${formularioGasto ? 'open' : ''}`}>
        <div className="modal admin-form-modal">
          <h3>{formularioGasto?.id ? 'Editar gasto' : 'Nuevo gasto'}</h3>
          {formularioGasto && (
            <form onSubmit={guardarGasto}>
              <label className="field">
                <span>Viaje *</span>
                <select
                  value={formularioGasto.viajeId}
                  onChange={(evento) =>
                    setFormularioGasto({
                      ...formularioGasto,
                      viajeId: evento.target.value,
                    })
                  }
                >
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
                <span>Pagador *</span>
                <select
                  value={formularioGasto.pagadorId}
                  onChange={(evento) =>
                    setFormularioGasto({
                      ...formularioGasto,
                      pagadorId: evento.target.value,
                    })
                  }
                >
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre}
                    </option>
                  ))}
                </select>
                {erroresFormulario.pagadorId && (
                  <small className="error-text">
                    {erroresFormulario.pagadorId}
                  </small>
                )}
              </label>

              <label className="field">
                <span>Concepto *</span>
                <input
                  value={formularioGasto.concepto}
                  onChange={(evento) =>
                    setFormularioGasto({
                      ...formularioGasto,
                      concepto: evento.target.value,
                    })
                  }
                />
                {erroresFormulario.concepto && (
                  <small className="error-text">
                    {erroresFormulario.concepto}
                  </small>
                )}
              </label>

              <div className="form-grid">
                <label className="field">
                  <span>Monto *</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formularioGasto.monto}
                    onChange={(evento) =>
                      setFormularioGasto({
                        ...formularioGasto,
                        monto: evento.target.value,
                      })
                    }
                  />
                  {erroresFormulario.monto && (
                    <small className="error-text">
                      {erroresFormulario.monto}
                    </small>
                  )}
                </label>

                <label className="field">
                  <span>Fecha *</span>
                  <input
                    type="date"
                    value={formularioGasto.fecha}
                    onChange={(evento) =>
                      setFormularioGasto({
                        ...formularioGasto,
                        fecha: evento.target.value,
                      })
                    }
                  />
                  {erroresFormulario.fecha && (
                    <small className="error-text">
                      {erroresFormulario.fecha}
                    </small>
                  )}
                </label>
              </div>

              <label className="field">
                <span>Categoría</span>
                <select
                  value={formularioGasto.categoria}
                  onChange={(evento) =>
                    setFormularioGasto({
                      ...formularioGasto,
                      categoria: evento.target.value,
                    })
                  }
                >
                  {categorias.map((categoriaGasto) => (
                    <option key={categoriaGasto}>{categoriaGasto}</option>
                  ))}
                </select>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button ghost"
                  onClick={() => setFormularioGasto(null)}
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
        isOpen={Boolean(gastoAEliminar)}
        title="Eliminar gasto"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        onConfirm={confirmarEliminacionGasto}
        onCancel={() => setGastoAEliminar(null)}
      />
    </>
  );
}
