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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    const cargarMetricas = async () => {
      setLoading(true);
      setError('');

      const resultados = await Promise.allSettled([
        api.get('/usuarios/paginados', { params: { page: 0, size: 1 } }),
        api.get('/viajes', { params: { page: 0, size: 1 } }),
        api.get('/actividades/paginadas', { params: { page: 0, size: 1 } }),
        api.get('/gastos/paginados', { params: { page: 0, size: 1 } }),
      ]);

      if (!activo) return;

      const [usuarios, viajes, actividades, gastos] = resultados;
      const cantidad = (resultado) => resultado.status === 'fulfilled' ? resultado.value.data?.totalElementos ?? null : null;

      setMetricas({
        usuarios: cantidad(usuarios),
        viajes:
          viajes.status === 'fulfilled'
            ? viajes.value.data?.totalElementos ?? viajes.value.data?.contenido?.length ?? null
            : null,
        actividades: cantidad(actividades),
        gastos: cantidad(gastos),
      });

      if (resultados.some((resultado) => resultado.status === 'rejected')) {
        setError('No fue posible cargar todos los indicadores.');
      }
      setLoading(false);
    };

    cargarMetricas();

    return () => {
      activo = false;
    };
  }, []);

  const tarjetas = [
    { etiqueta: 'Usuarios registrados', valor: metricas.usuarios, icono: Users },
    { etiqueta: 'Viajes registrados', valor: metricas.viajes, icono: Luggage },
    { etiqueta: 'Actividades registradas', valor: metricas.actividades, icono: Activity },
    { etiqueta: 'Gastos registrados', valor: metricas.gastos, icono: ReceiptText },
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

          {error && <p className="banner warn">{error}</p>}

          {loading ? (
            <div className="card panel" style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner"></div>
              <p className="muted">Cargando indicadores...</p>
            </div>
          ) : (
            <section className="stats-grid" aria-label="Indicadores de la plataforma">
              {tarjetas.map(({ etiqueta, valor, icono: Icono }) => (
                <article className="card stat-card" key={etiqueta}>
                  <div className="stat-icon"><Icono size={24} color="#0E7C7B" /></div>
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
