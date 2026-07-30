import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ImagePlus } from 'lucide-react';
import Navbar from './Navbar';
import LugarAutocomplete from './LugarAutocomplete';
import api from '../../service/api';
import { AuthContext } from '../../context/AuthContext';
import '../css/styles.css';

export default function CrearViaje() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    origen: '',
    destino: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    presupuestoEstimado: '',
    transporte: 'Avión',
    publico: true
  });

  const [origenLugar, setOrigenLugar] = useState(null);
  const [destinoLugar, setDestinoLugar] = useState(null);
  const [erroresLugar, setErroresLugar] = useState({ origen: '', destino: '' });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOrigenSelect = (texto, lugarObj) => {
    setFormData(prev => ({ ...prev, origen: texto }));
    setOrigenLugar(lugarObj);
    setErroresLugar(prev => ({ ...prev, origen: '' }));
  };

  const handleDestinoSelect = (texto, lugarObj) => {
    setFormData(prev => ({ ...prev, destino: texto }));
    setDestinoLugar(lugarObj);
    setErroresLugar(prev => ({ ...prev, destino: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombre.trim() || !formData.origen.trim() || !formData.destino.trim() || !formData.fechaInicio || !formData.fechaFin) {
      setError("Por favor completa los campos obligatorios: Nombre, Lugar de Origen, Lugar de Destino y Fechas.");
      return;
    }

    const hoy = new Date().toISOString().split('T')[0];
    if (formData.fechaInicio < hoy) {
      setError("La fecha de inicio no puede ser una fecha pasada.");
      return;
    }
    if (formData.fechaFin < formData.fechaInicio) {
      setError("La fecha de finalización no puede ser anterior a la fecha de inicio.");
      return;
    }

    if (!origenLugar || !destinoLugar) {
      setErroresLugar({
        origen: origenLugar ? '' : 'Selecciona un origen de las sugerencias.',
        destino: destinoLugar ? '' : 'Selecciona un destino de las sugerencias.',
      });
      setError('Selecciona el origen y el destino sugeridos por la búsqueda de lugares.');
      return;
    }

    try {
      setCargando(true);

      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        origen: formData.origen,
        destino: formData.destino,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        presupuestoEstimado: formData.presupuestoEstimado ? parseFloat(formData.presupuestoEstimado) : 0,
        transporte: formData.transporte,
        estado: 'PLANIFICACION',
        organizadorId: user?.id || 1,
        publico: formData.publico,
        origenLugar,
        destinoLugar
      };

      const response = await api.post('/viajes', payload);
      const viajeCreado = response.data;

      navigate('/viajes', { state: { viajeCreadoId: viajeCreado?.id } });
    } catch (err) {
      console.error("Error al crear viaje:", err);
      const msj = err.response?.data?.mensaje || err.response?.data?.message || "Ocurrió un error al guardar el viaje.";
      setError(msj);
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
              <span className="eyebrow">NUEVA AVENTURA</span>
              <h1>Crear viaje</h1>
              <p className="muted">
                Agrega la información inicial. Después podrás invitar participantes y construir el itinerario.
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
              <h3>Información general</h3>
              <div className="form-grid">
                <label className="field">
                  <span>Nombre del viaje *</span>
                  <input 
                    type="text" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Escapada a Cancún"
                    required
                  />
                </label>
              </div>

              {/* Origen y Destino con Geoapify Autocomplete */}
              <div className="form-grid">
                <LugarAutocomplete 
                  label="Lugar de origen (Salida) *"
                  placeholder="Ej. Ciudad de México, CDMX"
                  value={formData.origen}
                  onSelectLugar={handleOrigenSelect}
                  required
                  error={erroresLugar.origen}
                />
                <LugarAutocomplete 
                  label="Lugar de destino *"
                  placeholder="Ej. Cancún, Quintana Roo"
                  value={formData.destino}
                  onSelectLugar={handleDestinoSelect}
                  required
                  error={erroresLugar.destino}
                />
              </div>

              <label className="field">
                <span>Descripción</span>
                <textarea 
                  name="descripcion"
                  rows="3"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Detalles sobre el viaje, actividades planeadas, etc."
                />
              </label>
            </section>

            <section className="form-section">
              <h3>Fechas y presupuesto</h3>
              <div className="form-grid">
                <label className="field">
                  <span>Fecha de inicio *</span>
                  <input 
                    type="date" 
                    name="fechaInicio"
                    value={formData.fechaInicio}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="field">
                  <span>Fecha de finalización *</span>
                  <input 
                    type="date" 
                    name="fechaFin"
                    value={formData.fechaFin}
                    min={formData.fechaInicio || new Date().toISOString().split('T')[0]}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>Presupuesto por persona ($ MXN)</span>
                  <input 
                    type="number" 
                    name="presupuestoEstimado"
                    value={formData.presupuestoEstimado}
                    onChange={handleChange}
                    placeholder="12500"
                    min="0"
                    step="100"
                  />
                </label>
                <label className="field">
                  <span>Tipo de transporte</span>
                  <select 
                    name="transporte"
                    value={formData.transporte}
                    onChange={handleChange}
                  >
                    <option value="Avión">Avión</option>
                    <option value="Automóvil">Automóvil</option>
                    <option value="Autobús">Autobús</option>
                    <option value="Transporte rentado">Transporte rentado</option>
                  </select>
                </label>
              </div>
            </section>

            {user?.rol === 'AGENCIA' && (
              <section className="form-section">
                <h3>Visibilidad</h3>
                <label className="checkbox-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    name="publico"
                    checked={formData.publico}
                    onChange={handleChange}
                  />
                  <span>Viaje público (visible para todos los usuarios en "Viajes de Agencia")</span>
                </label>
              </section>
            )}

            <div className="form-actions">
              <Link className="button ghost" to="/viajes">
                Cancelar
              </Link>
              <button type="submit" className="button primary" disabled={cargando}>
                {cargando ? 'Guardando...' : 'Guardar viaje'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
