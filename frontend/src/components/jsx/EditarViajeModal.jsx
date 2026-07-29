import { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import api from '../../service/api';

export default function EditarViajeModal({ isOpen, onClose, viaje, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    origen: '',
    destino: '',
    fechaInicio: '',
    fechaFin: '',
    presupuestoEstimado: '',
    transporte: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && viaje) {
      setFormData({
        nombre: viaje.nombre || '',
        descripcion: viaje.descripcion || '',
        origen: viaje.origen || '',
        destino: viaje.destino || '',
        fechaInicio: viaje.fechaInicio || '',
        fechaFin: viaje.fechaFin || '',
        presupuestoEstimado: viaje.presupuestoEstimado || '',
        transporte: viaje.transporte || ''
      });
      setError('');
    }
  }, [isOpen, viaje]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre || !formData.origen || !formData.destino || !formData.fechaInicio || !formData.fechaFin) {
      setError('Por favor completa los campos obligatorios.');
      return;
    }

    if (formData.fechaFin < formData.fechaInicio) {
      setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...viaje,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        origen: formData.origen,
        destino: formData.destino,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        presupuestoEstimado: formData.presupuestoEstimado ? parseFloat(formData.presupuestoEstimado) : 0,
        transporte: formData.transporte
      };

      await api.put(`/viajes/${viaje.id}`, payload);
      onSaveSuccess('¡Viaje actualizado!', 'Los datos del viaje han sido modificados correctamente.');
      onClose();
    } catch (err) {
      console.error('Error al editar viaje:', err);
      setError('Ocurrió un error al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop open`}>
      <div className="modal" style={{ maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="modal-icon"><Edit2 size={24} /></div>
        <h3>Editar viaje</h3>
        
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Nombre del viaje *</span>
            <input 
              type="text" 
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Descripción</span>
            <textarea 
              name="descripcion"
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </label>

          <div className="form-grid">
            <label className="field">
              <span>Lugar de origen *</span>
              <input 
                type="text" 
                name="origen"
                value={formData.origen}
                onChange={handleChange}
                required
              />
            </label>
            <label className="field">
              <span>Lugar de destino *</span>
              <input 
                type="text" 
                name="destino"
                value={formData.destino}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Fecha de inicio *</span>
              <input 
                type="date" 
                name="fechaInicio"
                value={formData.fechaInicio}
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
                min={formData.fechaInicio}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Presupuesto por persona</span>
              <input 
                type="number" 
                name="presupuestoEstimado"
                value={formData.presupuestoEstimado}
                onChange={handleChange}
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

          <div className="modal-actions">
            <button type="button" className="button ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="button primary" disabled={loading}>
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
