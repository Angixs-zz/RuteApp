import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import LugarAutocomplete from './LugarAutocomplete';
import api from '../../service/api';
import { AuthContext } from '../../context/AuthContext';
import '../css/styles.css';

export default function CrearActividad() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Intentar obtener las fechas del viaje de la caché para limitar el selector de fecha
  const cachedTrip = sessionStorage.getItem(`trip_${id}`);
  const viajeData = cachedTrip ? JSON.parse(cachedTrip) : null;
  const fechaMin = viajeData?.fechaInicio ? `${viajeData.fechaInicio}T00:00` : undefined;
  const fechaMax = viajeData?.fechaFin ? `${viajeData.fechaFin}T23:59` : undefined;

  const [formData, setFormData] = useState({
    lugar: '',
    horario: '',
    descripcion: '',
    costoEstimado: '',
    estado: 'PENDIENTE',
    responsableId: user?.id || 1
  });

  const [lugarReferencia, setLugarReferencia] = useState(null);
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

  const handleLugarSelect = (texto, lugarObj) => {
    setFormData(prev => ({ ...prev, lugar: texto }));
    setLugarReferencia(lugarObj);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.lugar.trim() || !formData.horario) {
      setError("Por favor completa el lugar y el horario.");
      return;
    }

    try {
      setCargando(true);

      const payload = {
        lugar: formData.lugar,
        horario: formData.horario,
        descripcion: formData.descripcion,
        costoEstimado: formData.costoEstimado ? parseFloat(formData.costoEstimado) : 0,
        estado: formData.estado,
        viajeId: parseInt(id),
        responsableId: parseInt(formData.responsableId),
        lugarReferencia
      };

      await api.post('/actividades', payload);
      navigate(`/viajes/${id}/itinerario`);
    } catch (err) {
      console.error("Error al crear actividad:", err);
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        setError("⚠️ No se puede conectar con el servidor (Network Error). Revisa que tu backend en Spring Boot esté encendido.");
      } else {
        const msj = err.response?.data?.mensaje || err.response?.data?.message || "Ocurrió un error al guardar la actividad.";
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
              <Link className="eyebrow" style={{ color: 'var(--coral)', textDecoration: 'none' }} to={`/viajes/${id}/itinerario`}>
                ← Volver al itinerario
              </Link>
              <h1>Agregar actividad</h1>
              <p className="muted">
                Registra un nuevo evento o lugar a visitar en tu itinerario.
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
              <h3>Detalles principales</h3>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <LugarAutocomplete 
                  label="Lugar o nombre de la actividad *"
                  placeholder="Ej. Ruinas Mayas, Restaurante El Rey..."
                  value={formData.lugar}
                  onSelectLugar={handleLugarSelect}
                  required
                />
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>Fecha y Hora *</span>
                  <input 
                    type="datetime-local" 
                    name="horario"
                    value={formData.horario}
                    onChange={handleChange}
                    min={fechaMin}
                    max={fechaMax}
                    required
                  />
                  {fechaMin && <span className="muted" style={{fontSize:'0.75rem'}}>Debe estar entre {viajeData.fechaInicio} y {viajeData.fechaFin}</span>}
                </label>
                <label className="field">
                  <span>Estado</span>
                  <select 
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="PENDIENTE">Planificación (Pendiente)</option>
                    <option value="CONFIRMADA">Confirmada</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Descripción o notas (opcional)</span>
                <textarea 
                  name="descripcion"
                  rows="3"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Instrucciones, código de vestimenta, qué llevar..."
                />
              </label>
            </section>

            <section className="form-section">
              <h3>Responsabilidades y Presupuesto</h3>
              <div className="form-grid">
                <label className="field">
                  <span>Responsable</span>
                  <select 
                    name="responsableId"
                    value={formData.responsableId}
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
                  <span>Costo estimado ($ MXN)</span>
                  <input 
                    type="number" 
                    name="costoEstimado"
                    value={formData.costoEstimado}
                    onChange={handleChange}
                    placeholder="Ej. 1200"
                    min="0"
                    step="50"
                  />
                </label>
              </div>
            </section>

            <div className="form-actions">
              <Link className="button ghost" to={`/viajes/${id}/itinerario`}>
                Cancelar
              </Link>
              <button type="submit" className="button primary" disabled={cargando}>
                {cargando ? 'Guardando...' : 'Guardar actividad'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
