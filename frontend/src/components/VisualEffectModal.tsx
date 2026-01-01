import React, { useMemo, useState } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import NameModal from './NameModal';
import { SoundItem } from '../interfaces/sound';

interface Props {
  open: boolean;
  initial?: any;
  sounds: SoundItem[];
  existing: any[];
  onClose: () => void;
  onCreateSound?: (name: string) => Promise<void>;
  onSubmit: (data: { name: string; model?: string; sound?: { id: number } | null }) => void | Promise<void>;
}

const VisualEffectModal: React.FC<Props> = ({ open, initial, sounds, existing, onClose, onCreateSound, onSubmit }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [model, setModel] = useState(initial?.model ?? '');
  const [soundId, setSoundId] = useState<number | null>(initial?.sound?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createSoundOpen, setCreateSoundOpen] = useState(false);
  const [createSoundError, setCreateSoundError] = useState<string | null>(null);

  const existingNames = useMemo(() => new Set((existing || []).filter((x) => x.id !== initial?.id).map((x) => (x.name || '').trim().toLowerCase())), [existing, initial?.id]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ width: 640, maxWidth: '92vw' }}>
        <button className="icon option" title="Cerrar" onClick={onClose} aria-label="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
          <FaTimes size={18} />
        </button>
        <h2 style={{ marginTop: 0 }}>{initial?.id ? 'Editar Efecto Visual' : 'Nuevo Efecto Visual'}</h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const trimmed = name.trim();
            if (!trimmed) return setError('El nombre es requerido.');
            if (existingNames.has(trimmed.toLowerCase())) return setError('Ya existe un efecto visual con ese nombre.');
            try {
              setSaving(true);
              const payload: any = { name: trimmed, model: model || undefined };
              if (soundId) payload.sound = { id: Number(soundId) };
              else payload.sound = null;
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
            Modelo
            <input value={model} onChange={(e) => setModel(e.target.value)} />
          </label>

          <label>
            Sonido asociado
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={soundId ?? ''} onChange={(e) => setSoundId(e.target.value ? Number(e.target.value) : null)}>
                <option value="">(ninguno)</option>
                {(sounds || []).map((s) => (<option value={s.id} key={s.id}>{s.name}</option>))}
              </select>
              {onCreateSound ? (
                <button type="button" className="icon option" title="Añadir sonido" onClick={() => { setCreateSoundOpen(true); setCreateSoundError(null); }} aria-label="Añadir sonido" style={{ color: 'inherit' }}>
                  <FaPlus size={14} />
                </button>
              ) : null}
            </div>
          </label>

          {error ? <div style={{ color: '#e24444', fontSize: 13 }}>{error}</div> : null}

          <div className="actions">
            <button type="submit" className="confirm" disabled={saving}>{saving ? 'Confirmando...' : 'Confirmar'}</button>
            <button type="button" className="cancel" onClick={onClose} disabled={saving}>Cancelar</button>
          </div>
        </form>

        <NameModal
          open={createSoundOpen}
          title="Nuevo sonido"
          placeholder="Nombre del sonido"
          onCancel={() => { setCreateSoundOpen(false); setCreateSoundError(null); }}
          onConfirm={async (name) => {
            if (!onCreateSound) return;
            try {
              await onCreateSound(name);
              setCreateSoundOpen(false);
              setCreateSoundError(null);
            } catch (e: any) {
              setCreateSoundError(e?.message || 'No se pudo crear.');
            }
          }}
        />
      </div>
    </div>
  );
};

export default VisualEffectModal;
