import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** If set, user must type this phrase to enable confirm (e.g. 'eliminar'). */
  requireText?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const normalizeConfirmText = (value: string) => String(value ?? '').trim().toLowerCase();

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  requireText,
  onConfirm,
  onCancel,
}) => {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!open) return;
    setTyped('');
  }, [open, requireText]);

  const required = useMemo(() => {
    const r = String(requireText ?? '').trim();
    return r ? r : null;
  }, [requireText]);

  const canConfirm = useMemo(() => {
    if (!required) return true;
    return normalizeConfirmText(typed) === normalizeConfirmText(required);
  }, [required, typed]);

  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="icon option" onClick={onCancel} title="Cerrar" aria-label="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
          <FaTimes size={18} />
        </button>
        <h2 className="modal-title">{title || 'Confirmación'}</h2>
        <p>{message}</p>

        {required ? (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 6 }}>
              Escribe <b>{required}</b> para habilitar confirmar.
            </div>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={required}
              autoComplete="off"
            />
          </div>
        ) : null}

        <div className="actions">
          <button className="button confirm" onClick={onConfirm} disabled={!canConfirm}>
            {confirmLabel || 'Confirmar'}
          </button>
          <button className="button cancel" onClick={onCancel}>
            {cancelLabel || 'Cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
