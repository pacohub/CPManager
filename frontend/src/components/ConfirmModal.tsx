import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirmación</h2>
        <p>{message}</p>
        <div className="actions">
          <button onClick={onConfirm}>Confirmar</button>
          <button className="button-cancel" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
