import { useState, useEffect, useContext } from 'react';
import { Calendar, Edit2 } from 'lucide-react';
import api from '../../service/api';
import { AuthContext } from '../../context/AuthContext';

export default function RegistrarGasto({ 
  isOpen, 
  onClose, 
  gastoAEditar, 
  viajeId, 
  participantes, 
  viajeDates, 
  viajeOrgId,
  onSaveSuccess,
  onSaveError
}) {
  const { user } = useContext(AuthContext);
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('OTRO');
  const [pagadorId, setPagadorId] = useState('');
  const [fecha, setFecha] = useState('');
  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active && isOpen) {
      if (gastoAEditar) {
        setConcepto(gastoAEditar.concepto);
        setMonto(gastoAEditar.monto);
        setCategoria(gastoAEditar.categoria);
        setPagadorId(gastoAEditar.pagadorId || (participantes.length > 0 ? participantes[0].id : ''));
        if (user?.id !== viajeOrgId) {
          setPagadorId(user?.id);
        }
        setFecha(gastoAEditar.rawFecha || new Date().toISOString().split('T')[0]);
      } else {
        setConcepto('');
        setMonto('');
        setCategoria('OTRO');
        setPagadorId(user?.id !== viajeOrgId ? user?.id : (participantes.length > 0 ? participantes[0].id : ''));
        setFecha(new Date().toISOString().split('T')[0]);
      }
      setErrors({});
      }
    });
    return () => {
      active = false;
    };
  }, [isOpen, gastoAEditar, participantes, user?.id, viajeOrgId]);

  const handleGuardarGasto = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!concepto.trim()) newErrors.concepto = 'El concepto es obligatorio.';
    if (!monto || parseFloat(monto) <= 0) newErrors.monto = 'El monto debe ser mayor a 0.';
    if (!pagadorId) newErrors.pagadorId = 'Selecciona quién pagó.';
    if (!fecha) newErrors.fecha = 'Selecciona una fecha.';
    else {
      if (viajeDates.inicio && viajeDates.fin) {
        const dateGasto = new Date(fecha + 'T00:00:00');
        const dateIni = new Date(viajeDates.inicio + 'T00:00:00');
        const dateFin = new Date(viajeDates.fin + 'T23:59:59');
        if (dateGasto < dateIni || dateGasto > dateFin) {
          newErrors.fecha = `La fecha debe estar entre ${viajeDates.inicio} y ${viajeDates.fin}.`;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setGuardando(true);

    try {
      const payload = {
        viajeId: parseInt(viajeId, 10),
        pagadorId: parseInt(pagadorId, 10),
        concepto,
        monto: parseFloat(monto),
        categoria,
        fecha
      };

      if (gastoAEditar) {
        await api.put(`/gastos/${gastoAEditar.id}`, payload);
        onSaveSuccess('¡Cambios guardados!', 'El gasto se ha editado exitosamente.');
      } else {
        await api.post('/gastos', payload);
        onSaveSuccess('¡Gasto registrado!', 'El gasto se ha guardado exitosamente.');
      }
      onClose();
    } catch (err) {
      console.error("Error guardando gasto", err);
      if (onSaveError) onSaveError('Error al guardar el gasto');
    } finally {
      setGuardando(false);
    }
  };



  //----------------------------------------
  return (
    <div className={`modal-backdrop ${isOpen ? 'open' : ''}`}>
      <div className="modal">
        <div className="modal-icon">{gastoAEditar ? <Edit2 size={24} /> : <Calendar size={24} />}</div>
        <h3>{gastoAEditar ? 'Editar gasto' : 'Registrar gasto'}</h3>
        <form onSubmit={handleGuardarGasto}>
          <label className="field">
            <span>Concepto / Descripción</span>
            <input 
              type="text" 
              placeholder="Ej. Cenas, Vuelo redondo, Tour" 
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
            />
            {errors.concepto && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.concepto}</span>}
          </label>
          
          <div className="form-grid">
            <label className="field">
              <span>Monto total ($ MXN)</span>
              <input 
                type="number"
                step="0.01"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
              {errors.monto && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.monto}</span>}
            </label>

            <label className="field">
              <span>Fecha del gasto</span>
              <input 
                type="date" 
                value={fecha}
                min={viajeDates?.inicio || undefined}
                max={viajeDates?.fin || undefined}
                onChange={(e) => setFecha(e.target.value)}
              />
              {errors.fecha && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.fecha}</span>}
            </label>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>¿Quién lo pagó?</span>
              <select 
                value={pagadorId} 
                onChange={(e) => setPagadorId(e.target.value)}
                disabled={user?.id !== viajeOrgId}
              >
                {participantes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
                {participantes.length === 0 && (
                  <option value="">No hay participantes</option>
                )}
              </select>
              {user?.id !== viajeOrgId && (
                <span style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                  Como participante solo puedes registrar gastos propios.
                </span>
              )}
              {errors.pagadorId && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.pagadorId}</span>}
            </label>

            <label className="field">
              <span>Categoría</span>
              <select 
                value={categoria} 
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="TRANSPORTE">Transporte</option>
                <option value="HOSPEDAJE">Hospedaje</option>
                <option value="COMIDA">Comida</option>
                <option value="ENTRETENIMIENTO">Entretenimiento</option>
                <option value="OTRO">Otro</option>
              </select>
            </label>
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="button ghost" 
              onClick={onClose}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button type="submit" className="button primary" disabled={guardando}>
              {guardando ? 'Guardando...' : (gastoAEditar ? 'Guardar cambios' : 'Guardar gasto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
