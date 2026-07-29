import React from 'react';
import { Check } from 'lucide-react';

export default function SuccessModal({ isOpen, title, message, onAccept, acceptText = "Aceptar" }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop open">
      <div className="modal">
        <div className="modal-icon" style={{ backgroundColor: '#10B981', color: 'white', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
          <Check size={28} strokeWidth={3} />
        </div>
        <h3>{title}</h3>
        <p className="muted">{message}</p>
        <div className="modal-actions" style={{ justifyContent: 'center' }}>
          <button className="button primary" onClick={onAccept}>
            {acceptText}
          </button>
        </div>
      </div>
    </div>
  );
}
