import React from 'react';
import '../css/styles.css'; // Asumimos que aquí o en un CSS global agregaremos estilos para el modal

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-content" style={contentStyle}>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        <p>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button className="button ghost" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="button primary" onClick={onConfirm} style={{ backgroundColor: '#FF735C' }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const contentStyle = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '12px',
  maxWidth: '400px',
  width: '90%',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
};
