import React, { useMemo, useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import NameModal from './NameModal';
import { uploadEffectIcon } from '../js/effectApi';

interface Props {
  open: boolean;
  initial?: any;
  existing: any[];
  onClose: () => void;
  onSubmit: (data: { name: string; type?: string | null; description?: string | null; icon?: string | null }) => void | Promise<void>;
}

const EffectModal: React.FC<Props> = ({ open, initial, existing, onClose, onSubmit }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<string | null>(initial?.type ?? 'benefit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [icon, setIcon] = useState<string | null>(initial?.icon ?? '');
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const existingNames = useMemo(() => new Set((existing || []).filter((x) => x.id !== initial?.id).map((x) => (x.name || '').trim().toLowerCase())), [existing, initial?.id]);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setType(initial?.type ?? 'benefit');
    setDescription(initial?.description ?? '');
    setIcon(initial?.icon ?? '');
    setError(null);
  }, [open, initial]);

  function asImageUrl(raw?: string): string | undefined {
    const v = (raw || '').trim();
    if (!v) return undefined;
    if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
    if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
    return undefined;
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ width: 520, maxWidth: '92vw' }}>
        <button className="icon option" title="Cerrar" onClick={onClose} aria-label="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
          <FaTimes size={18} />
        </button>
        <h2 style={{ marginTop: 0 }}>{initial?.id ? 'Editar Efecto' : 'Nuevo Efecto'}</h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const trimmed = name.trim();
            if (!trimmed) return setError('El nombre es requerido.');
            if (existingNames.has(trimmed.toLowerCase())) return setError('Ya existe un efecto con ese nombre.');
            try {
              setSaving(true);
              const payload: any = { name: trimmed, type: type ?? undefined, description: description?.trim() || undefined };
              if (icon && String(icon).trim()) payload.icon = String(icon).trim();
              await onSubmit(payload);
            } catch (err: any) {
              setError(err?.message || 'Error guardando');
            } finally {
              setSaving(false);
            }
          }}
        >
          <label>
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={140} />
          </label>

          <label>
            Descripción
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: 80 }} />
          </label>



          <label style={{ display: 'block', marginTop: 8 }}>
            Subir icono local
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
              <input type="file" accept="image/*" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  setUploadingIcon(true);
                  const uploaded = await uploadEffectIcon(f);
                  setIcon(uploaded);
                } catch (err: any) {
                  setError(err?.message || 'Error subiendo archivo');
                } finally {
                  setUploadingIcon(false);
                }
              }} />
              {uploadingIcon ? <span style={{ opacity: 0.9 }}>Subiendo...</span> : null}
              {icon ? (
                <img src={asImageUrl(icon)} alt="preview" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
              ) : null}
            </div>
          </label>

          <label>
            Tipo
            <select value={type ?? ''} onChange={(e) => setType(e.target.value || null)}>
              <option value="benefit">Beneficio</option>
              <option value="harm">Perjuicio</option>
            </select>
          </label>
          {error ? <div style={{ color: '#e24444', fontSize: 13 }}>{error}</div> : null}

          <div className="actions">
            <button type="submit" className="confirm" disabled={saving}>{saving ? 'Confirmando...' : 'Confirmar'}</button>
            <button type="button" className="cancel" onClick={onClose} disabled={saving}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EffectModal;
