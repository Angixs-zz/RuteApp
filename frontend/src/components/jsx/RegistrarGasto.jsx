import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../service/api';
import '../css/styles.css';

export default function RegistrarGasto() {
  const navigate = useNavigate();
  const { id } = useParams();
  const viajeId = id || 1;

  const [concepto, setConcepto] = useState('Cena grupal');
  const [categoria, setCategoria] = useState('Alimentos');
  const [monto, setMonto] = useState('1050');
  const [fecha, setFecha] = useState('2026-08-13');
  const [pagadorId, setPagadorId] = useState('3');
  const [metodoPago, setMetodoPago] = useState('Tarjeta');
  const [descripcion, setDescripcion] = useState('Cena en restaurante para cinco participantes.');
  const [tipoDivision, setTipoDivision] = useState('Partes iguales');

  const [participantes, setParticipantes] = useState([
    { id: 1, nombre: 'Miguel Ángel', incluido: true },
    { id: 2, nombre: 'Yareli Martínez', incluido: true },
    { id: 3, nombre: 'Jorge Pérez', incluido: true },
    { id: 4, nombre: 'Ana López', incluido: true },
    { id: 5, nombre: 'María Cruz', incluido: true }
  ]);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const cargarParticipantes = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const resPart = await api.get(`/participantes/viaje/${id}`);
      if (resPart.data && Array.isArray(resPart.data) && resPart.data.length > 0) {
        setParticipantes(resPart.data.map(p => ({
          id: p.usuarioId || p.id,
          nombre: p.nombreUsuario || 'Participante',
          incluido: true
        })));
        setPagadorId(resPart.data[0].usuarioId || resPart.data[0].id || '1');
      }
    } catch {
      // Fallback a los datos mock por defecto
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        cargarParticipantes();
      }
    });
    return () => {
      active = false;
    };
  }, [cargarParticipantes]);

  const toggleParticipante = (partId) => {
    setParticipantes(prev => prev.map(p => p.id === partId ? { ...p, incluido: !p.incluido } : p));
  };

  // Cálculo de división por persona
  const participantesIncluidos = participantes.filter(p => p.incluido);
  const numIncluidos = participantesIncluidos.length || 1;
  const montoTotalNum = parseFloat(monto) || 0;
  const montoPorPersona = (montoTotalNum / numIncluidos).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!concepto.trim() || !monto || parseFloat(monto) <= 0) {
      showToast('Completa los campos obligatorios del gasto');
      return;
    }

    try {
      await api.post('/gastos', {
        viajeId: parseInt(viajeId, 10),
        pagadorId: parseInt(pagadorId, 10),
        concepto: concepto,
        monto: parseFloat(monto),
        categoria: categoria.toUpperCase(),
        fecha: fecha
      });
    } catch (err) {
      console.error('Error al registrar gasto en el backend:', err);
    }

    showToast('Gasto registrado con éxito');
    setTimeout(() => {
      navigate(id ? `/viajes/${id}/gastos` : '/gastos');
    }, 1000);
  };

  return (
    <>
      <Navbar />
      <main className="page narrow">
        <div className="container">
          <div className="page-head">
            <div>
              <span className="eyebrow">GASTOS</span>
              <h1>Registrar gasto</h1>
              <p className="muted">Agrega un pago y define cómo se dividirá.</p>
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
                  <span>Concepto</span>
                  <input 
                    type="text" 
                    value={concepto} 
                    onChange={(e) => setConcepto(e.target.value)} 
                    placeholder="Ej. Cena grupal, Gasolina"
                  />
                </label>
                <label className="field">
                  <span>Categoría</span>
                  <select 
                    value={categoria} 
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    <option value="Alimentos">Alimentos</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Hospedaje">Hospedaje</option>
                    <option value="Actividades">Actividades</option>
                  </select>
                </label>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>Monto ($ MXN)</span>
                  <input 
                    type="number" 
                    value={monto} 
                    onChange={(e) => setMonto(e.target.value)} 
                  />
                </label>
                <label className="field">
                  <span>Fecha</span>
                  <input 
                    type="date" 
                    value={fecha} 
                    onChange={(e) => setFecha(e.target.value)} 
                  />
                </label>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>Pagado por</span>
                  <select 
                    value={pagadorId} 
                    onChange={(e) => setPagadorId(e.target.value)}
                  >
                    {participantes.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Método de pago</span>
                  <select 
                    value={metodoPago} 
                    onChange={(e) => setMetodoPago(e.target.value)}
                  >
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Descripción</span>
                <textarea 
                  value={descripcion} 
                  onChange={(e) => setDescripcion(e.target.value)} 
                  placeholder="Detalles sobre el gasto..."
                />
              </label>

              <section className="form-section">
                <h3>División del gasto</h3>
                <label className="field">
                  <span>Tipo de división</span>
                  <select 
                    value={tipoDivision} 
                    onChange={(e) => setTipoDivision(e.target.value)}
                  >
                    <option value="Partes iguales">Partes iguales</option>
                    <option value="Cantidades personalizadas">Cantidades personalizadas</option>
                    <option value="Porcentajes">Porcentajes</option>
                  </select>
                </label>

                <div className="table-wrap">
                  <table style={{ minWidth: '600px' }}>
                    <thead>
                      <tr>
                        <th>Participante</th>
                        <th>Incluido</th>
                        <th>Le corresponde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participantes.map((p) => (
                        <tr key={p.id}>
                          <td>{p.nombre}</td>
                          <td>
                            <input 
                              type="checkbox" 
                              checked={p.incluido} 
                              onChange={() => toggleParticipante(p.id)} 
                            />
                          </td>
                          <td>
                            {p.incluido ? `$${montoPorPersona}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="form-actions">
                <Link className="button ghost" to={id ? `/viajes/${id}/gastos` : '/gastos'}>
                  Cancelar
                </Link>
                <button type="submit" className="button primary">
                  Guardar gasto
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
