import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../service/api';
import { AuthContext } from '../../context/AuthContext';
import '../css/styles.css';

export default function RegistrarGasto() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fechas del viaje para validar
  const cachedTrip = sessionStorage.getItem(`trip_${id}`);
  const viajeData = cachedTrip ? JSON.parse(cachedTrip) : null;
  const fechaMin = viajeData?.fechaInicio || undefined;
  const fechaMax = viajeData?.fechaFin || undefined;

  const [formData, setFormData] = useState({
    concepto: '',
    monto: '',
    categoria: 'OTRO',
    fecha: new Date().toISOString().split('T')[0],
    pagadorId: user?.id || 1
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [participantes, setParticipantes] = useState([]);

  useEffect(() => {
    const fetchParticipantes = async () => {
      try {
        const res = await api.get(`/participantes/viaje/${id}`, { timeout: 1500 });
        setParticipantes(res.data || []);
      } catch (err) {
        console.error("Error cargando participantes", err);
      }
    };
    if (id) fetchParticipantes();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.concepto.trim() || !formData.monto || formData.monto <= 0) {
      setError("Por favor ingresa un concepto válido y un monto mayor a 0.");
      return;
    }

    try {
      setCargando(true);

      const payload = {
        viajeId: parseInt(id),
        pagadorId: parseInt(formData.pagadorId),
        concepto: formData.concepto.trim(),
        monto: parseFloat(formData.monto),
        categoria: formData.categoria,
        fecha: formData.fecha
      };

      const response = await api.post('/gastos', payload);
      
      // Actualizar la caché inmediatamente para que no haya tiempo de carga al redirigir
      const cached = sessionStorage.getItem(`gastos_${id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.push(response.data);
        sessionStorage.setItem(`gastos_${id}`, JSON.stringify(parsed));
      }

      navigate(`/viajes/${id}/gastos`);
    } catch (err) {
      console.error("Error al registrar gasto:", err);
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        setError("⚠️ No se puede conectar con el servidor (Network Error). Revisa que tu backend en Spring Boot esté encendido.");
      } else {
        const msj = err.response?.data?.mensaje || err.response?.data?.message || "Ocurrió un error al guardar el gasto.";
        setError(msj);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page narrow">
        <div className="container">
          <div className="page-head">
            <div>
              <Link className="eyebrow" style={{ color: 'var(--coral)', textDecoration: 'none' }} to={`/viajes/${id}/gastos`}>
                ← Volver a gastos
              </Link>
              <h1>Registrar gasto</h1>
              <p className="muted">
                Añade un nuevo gasto al viaje para llevar el control del presupuesto.
              </p>
            </div>
          </div>

          {error && (
            <div className="toast active" style={{ position: 'relative', margin: '0 0 1.5rem 0', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '1rem', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          <form className="card form-card" onSubmit={handleSubmit}>
            <section className="form-section">
              <h3>Detalles del gasto</h3>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <label className="field">
                  <span>Concepto *</span>
                  <input 
                    type="text" 
                    name="concepto"
                    value={formData.concepto}
                    onChange={handleChange}
                    placeholder="Ej. Cenas en el centro, Boletos de museo..."
                    required
                  />
                </label>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>Monto ($ MXN) *</span>
                  <input 
                    type="number" 
                    name="monto"
                    value={formData.monto}
                    onChange={handleChange}
                    placeholder="Ej. 450"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </label>
                <label className="field">
                  <span>Categoría</span>
                  <select 
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                  >
                    <option value="TRANSPORTE">Transporte</option>
                    <option value="HOSPEDAJE">Hospedaje</option>
                    <option value="COMIDA">Comida</option>
                    <option value="ENTRETENIMIENTO">Entretenimiento</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </label>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>Pagado por</span>
                  <select 
                    name="pagadorId"
                    value={formData.pagadorId}
                    onChange={handleChange}
                  >
                    <option value={user?.id || 1}>Yo ({user?.nombre || 'Miguel'})</option>
                    {participantes.map(p => (
                      <option key={p.usuario.id} value={p.usuario.id}>
                        {p.usuario.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Fecha</span>
                  <input 
                    type="date" 
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    min={fechaMin}
                    max={fechaMax}
                    required
                  />
                  {fechaMin && <span className="muted" style={{fontSize:'0.75rem'}}>Debe estar entre {viajeData.fechaInicio} y {viajeData.fechaFin}</span>}
                </label>
              </div>
            </section>

            <div className="form-actions">
              <Link className="button ghost" to={`/viajes/${id}/gastos`}>
                Cancelar
              </Link>
              <button type="submit" className="button primary" disabled={cargando}>
                {cargando ? 'Guardando...' : 'Guardar gasto'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
