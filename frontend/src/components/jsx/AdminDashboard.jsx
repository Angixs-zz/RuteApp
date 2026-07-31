import { useEffect, useState } from 'react';
import { Activity, Luggage, ReceiptText, Users } from 'lucide-react';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

const metricasIniciales = {
  usuarios: null,
  viajes: null,
  actividades: null,
  gastos: null,
};

export default function AdminDashboard() {
  const [metricas, setMetricas] = useState(metricasIniciales);
  const [cargandoMetricas, setCargandoMetricas] = useState(true);
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    let componenteActivo = true;

    const cargarMetricas = async () => {
      setCargandoMetricas(true);
      setMensajeError('');

      const resultadosSolicitudes = await Promise.allSettled([
        api.get('/usuarios/paginados', {
          params: {
            page: 0,
            size: 1,
          },
        }),
        api.get('/viajes', {
          params: {
            page: 0,
            size: 1,
          },
        }),
        api.get('/actividades/paginadas', {
          params: {
            page: 0,
            size: 1,
          },
        }),
        api.get('/gastos/paginados', {
          params: {
            page: 0,
            size: 1,
          },
        }),
      ]);

      if (!componenteActivo) {
        return;
      }

      const [resultadoUsuarios, resultadoViajes, resultadoActividades, resultadoGastos] =
        resultadosSolicitudes;
      const obtenerCantidadTotal = (resultadoSolicitud) =>
        resultadoSolicitud.status === 'fulfilled'
          ? resultadoSolicitud.value.data?.totalElementos ?? null
          : null;

      setMetricas({
        usuarios: obtenerCantidadTotal(resultadoUsuarios),
        viajes:
          resultadoViajes.status === 'fulfilled'
            ? resultadoViajes.value.data?.totalElementos ??
              resultadoViajes.value.data?.contenido?.length ??
              null
            : null,
        actividades: obtenerCantidadTotal(resultadoActividades),
        gastos: obtenerCantidadTotal(resultadoGastos),
      });

      if (
        resultadosSolicitudes.some(
          (resultadoSolicitud) => resultadoSolicitud.status === 'rejected',
        )
      ) {
        setMensajeError('No fue posible cargar todos los indicadores.');
      }
      setCargandoMetricas(false);
    };

    cargarMetricas();

    return () => {
      componenteActivo = false;
    };
  }, []);

  const tarjetas = [
    {
      etiqueta: 'Usuarios registrados',
      valor: metricas.usuarios,
      icono: Users,
    },
    {
      etiqueta: 'Viajes registrados',
      valor: metricas.viajes,
      icono: Luggage,
    },
    {
      etiqueta: 'Actividades registradas',
      valor: metricas.actividades,
      icono: Activity,
    },
    {
      etiqueta: 'Gastos registrados',
      valor: metricas.gastos,
      icono: ReceiptText,
    },
  ];

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="eyebrow">ADMINISTRACIÓN</span>
              <h1>Panel de administración</h1>
              <p className="muted">Consulta el estado general de la plataforma.</p>
            </div>
          </div>

          {mensajeError && <p className="banner warn">{mensajeError}</p>}

          {cargandoMetricas ? (
            <div
              className="card panel"
              style={{ textAlign: 'center', padding: '40px' }}
            >
              <div className="spinner"></div>
              <p className="muted">Cargando indicadores...</p>
            </div>
          ) : (
            <section
              className="stats-grid"
              aria-label="Indicadores de la plataforma"
            >
              {tarjetas.map(({ etiqueta, valor, icono: Icono }) => (
                <article className="card stat-card" key={etiqueta}>
                  <div className="stat-icon">
                    <Icono size={24} color="#0E7C7B" />
                  </div>
                  <div>
                    <strong>{valor ?? 'No disponible'}</strong>
                    <span>{etiqueta}</span>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
