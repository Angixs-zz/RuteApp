import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MapPin, Map } from 'lucide-react';
import Navbar from './Navbar';
import api from '../../service/api';
import LugarAutocomplete from './LugarAutocomplete';
import { AuthContext } from '../../context/AuthContext';
import '../css/styles.css';

export default function CrearActividad() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const viajeId = id || 1;

  const [nombre, setNombre] = useState('Visita a Isla Mujeres');
  const [lugar, setLugar] = useState('Muelle Cancún');
  const [lugarLugarData, setLugarLugarData] = useState(null);
  const [fecha, setFecha] = useState('2026-08-13');
  const [responsableId, setResponsableId] = useState('1');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('15:00');
  const [costoEstimado, setCostoEstimado] = useState('1200');
  const [estado, setEstado] = useState('Planeada');
  const [descripcion, setDescripcion] = useState('Traslado en ferry, recorrido por el centro y tiempo libre en Playa Norte.');

  const [participantes, setParticipantes] = useState([
    { id: 1, nombre: 'Miguel Ángel' },
    { id: 2, nombre: 'Yareli Martínez' },
    { id: 3, nombre: 'Jorge Pérez' },
    { id: 4, nombre: 'Ana López' }
  ]);

  const [nombreViaje, setNombreViaje] = useState('Escapada a Cancún');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const cargarDatos = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const resViaje = await api.get(`/viajes/${id}`);
      if (resViaje.data && resViaje.data.nombre) {
        setNombreViaje(resViaje.data.nombre);
      }

      const resPart = await api.get(`/participantes/viaje/${id}`);
      if (resPart.data && Array.isArray(resPart.data) && resPart.data.length > 0) {
        setParticipantes(resPart.data.map(p => ({
          id: p.usuarioId || p.id,
          nombre: p.nombreUsuario || 'Participante'
        })));
        
        if (user?.rol === 'AGENCIA') {
          setResponsableId(user.id);
        } else {
          setResponsableId(resPart.data[0].usuarioId || resPart.data[0].id || '1');
        }
      } else if (user?.rol === 'AGENCIA') {
        setResponsableId(user.id);
      }
    } catch {
      // Fallback a los valores mock por defecto
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        cargarDatos();
      }
    });
    return () => {
      active = false;
    };
  }, [cargarDatos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !lugar.trim() || !fecha) {
      showToast('Completa los campos obligatorios');
      return;
    }

    try {
      const horarioDateTime = `${fecha}T${horaInicio}:00`;
      await api.post('/actividades', {
        viajeId: parseInt(viajeId, 10),
        lugar: lugar,
        horario: horarioDateTime,
        descripcion: `${nombre} - ${descripcion}`,
        responsableId: parseInt(responsableId, 10),
        costoEstimado: costoEstimado ? parseFloat(costoEstimado) : 0,
        estado: estado,
        lugarReferencia: lugarLugarData || undefined
      });
    } catch (err) {
      console.error('Error al guardar actividad en el backend:', err);
    }

    showToast('Actividad guardada en el itinerario');
    setTimeout(() => {
      navigate(id ? `/viajes/${id}/itinerario` : '/itinerario');
    }, 1000);
  };





  //---------------------------------------------------
  return (
    <>
      <Navbar />
      <main className="page narrow">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="eyebrow">ITINERARIO</span>
              <h1>Nueva actividad</h1>
              <p className="muted">Agrega una actividad al viaje {nombreViaje}.</p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6B7280' }}>
              Cargando formulario...
            </div>
          ) : (
            <form className="card form-card" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label className="field">
                  <span>Nombre de la actividad</span>
                  <input 
                    type="text" 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)} 
                    placeholder="Ej. Visita al museo"
                  />
                </label>

                <div className="field">
                  <LugarAutocomplete 
                    label="Lugar"
                    placeholder="Muelle Cancún"
                    value={lugar}
                    onChange={(val) => setLugar(val)}
                    onSelectLugar={(lugarObj) => {
                      setLugar(lugarObj.displayName || lugarObj.nombre);
                      setLugarLugarData(lugarObj);
                    }}
                  />
                </div>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>Fecha</span>
                  <input 
                    type="date" 
                    value={fecha} 
                    onChange={(e) => setFecha(e.target.value)} 
                  />
                </label>
                <label className="field">
                  <span>Responsable</span>
                  {user?.rol === 'AGENCIA' ? (
                     <div style={{ padding: '0.75rem', background: '#F3F4F6', borderRadius: '8px', color: '#4B5563', border: '1px solid #D1D5DB' }}>
                       {user.nombre} (Organizador)
                     </div>
                  ) : (
                    <select 
                      value={responsableId} 
                      onChange={(e) => setResponsableId(e.target.value)}
                    >
                      {participantes.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  )}
                </label>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>Hora de inicio</span>
                  <input 
                    type="time" 
                    value={horaInicio} 
                    onChange={(e) => setHoraInicio(e.target.value)} 
                  />
                </label>
                <label className="field">
                  <span>Hora de finalización</span>
                  <input 
                    type="time" 
                    value={horaFin} 
                    onChange={(e) => setHoraFin(e.target.value)} 
                  />
                </label>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>Costo estimado ($ MXN)</span>
                  <input 
                    type="number" 
                    value={costoEstimado} 
                    onChange={(e) => setCostoEstimado(e.target.value)} 
                    placeholder="0"
                  />
                </label>
                <label className="field">
                  <span>Estado</span>
                  <select 
                    value={estado} 
                    onChange={(e) => setEstado(e.target.value)}
                  >
                    <option value="Planeada">Planeada</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Completada">Completada</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Descripción y notas</span>
                <textarea 
                  value={descripcion} 
                  onChange={(e) => setDescripcion(e.target.value)} 
                  placeholder="Detalles sobre el traslado, recomendaciones, etc."
                />
              </label>

              <div className="cover-uploader" style={{ textAlign: 'left' }}>
                <strong><MapPin size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Resultado de lugar</strong>
                <p className="small muted">{lugar || 'Cancún'} · Vista previa del mapa</p>
                <div style={{ height: '170px', borderRadius: '12px', background: 'linear-gradient(135deg, #D8ECE9, #B7D6C8)', display: 'grid', placeItems: 'center', fontSize: '42px' }}>
                  <Map size={48} color="white" />
                </div>
              </div>

              <div className="form-actions">
                <Link className="button ghost" to={id ? `/viajes/${id}/itinerario` : '/itinerario'}>
                  Cancelar
                </Link>
                <button type="submit" className="button primary">
                  Guardar actividad
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </>
  );
}
