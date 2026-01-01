import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

interface Props {
  open: boolean;
  initial?: any;
  visuals: any[];
  onClose: () => void;
  onSubmit: (data: any) => void | Promise<void>;
}

const SkillModal: React.FC<Props> = ({ open, initial, visuals, onClose, onSubmit }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [levels, setLevels] = useState<number>(initial?.levels ?? 1);
  const [casterVisualId, setCasterVisualId] = useState<number | null>(initial?.casterVisual?.id ?? null);
  const [missileVisualId, setMissileVisualId] = useState<number | null>(initial?.missileVisual?.id ?? null);
  const [targetVisualId, setTargetVisualId] = useState<number | null>(initial?.targetVisual?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingNames = useMemo(() => new Set((visuals || []).map((v: any) => v.name)), [visuals]);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setDescription(initial?.description ?? '');
    setIcon(initial?.icon ?? '');
    setLevels(initial?.levels ?? 1);
    setCasterVisualId(initial?.casterVisual?.id ?? null);
    setMissileVisualId(initial?.missileVisual?.id ?? null);
    setTargetVisualId(initial?.targetVisual?.id ?? null);
    setError(null);
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ width: 640, maxWidth: '94vw' }}>
        <button className="icon option" title="Cerrar" onClick={onClose} aria-label="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
          <FaTimes size={18} />
        </button>
        <h2 style={{ marginTop: 0 }}>{initial?.id ? 'Editar Habilidad' : 'Nueva Habilidad'}</h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const trimmed = name.trim();
            if (!trimmed) return setError('El nombre es requerido.');
            try {
              setSaving(true);
              const payload: any = {
                name: trimmed,
                description: description?.trim() || undefined,
                icon: icon?.trim() || undefined,
                levels: Number(levels) || 1,
                casterVisualId: casterVisualId ? Number(casterVisualId) : undefined,
                missileVisualId: missileVisualId ? Number(missileVisualId) : undefined,
                targetVisualId: targetVisualId ? Number(targetVisualId) : undefined,
              };
              await onSubmit(payload);
            } catch (err: any) {
              setError(err?.message || 'Error guardando');
            } finally {
              setSaving(false);
            }
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ flex: 1 }}>
              Nombre
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={140} />
            </label>

            <label style={{ width: 120 }}>
              Niveles
              <input className="no-spin" type="number" value={levels} min={1} onChange={(e) => setLevels(Number(e.target.value) || 1)} />
            </label>
          </div>


          <label>
            Descripción
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: 80 }} />
          </label>

          <label>
            Icono (imagen)
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="file" accept="image/*" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  setError(null);
                  const fd = new FormData();
                  fd.append('iconImage', f);
                  const res = await fetch('http://localhost:4000/skills/upload-icon', { method: 'POST', body: fd });
                  const payload = await res.json();
                  if (!res.ok) throw new Error(payload?.message || 'Upload failed');
                  // make absolute URL for preview
                  setIcon(payload.icon ? `http://localhost:4000${payload.icon}` : '');
                } catch (err: any) {
                  setError(err?.message || 'No se pudo subir la imagen');
                }
              }} />
              {icon ? <img src={icon} alt="icon preview" style={{ height: 36, width: 36, objectFit: 'cover', borderRadius: 6, boxShadow: '0 1px 4px #0006' }} /> : null}
            </div>
          </label>

          <label>
            Efecto Visual (caster)
            <select value={casterVisualId ?? ''} onChange={(e) => setCasterVisualId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">(ninguno)</option>
              {(visuals || []).map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </label>

          <label>
            Efecto Visual (misil)
            <select value={missileVisualId ?? ''} onChange={(e) => setMissileVisualId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">(ninguno)</option>
              {(visuals || []).map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </label>

          <label>
            Efecto Visual (target)
            <select value={targetVisualId ?? ''} onChange={(e) => setTargetVisualId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">(ninguno)</option>
              {(visuals || []).map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
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

export default SkillModal;
