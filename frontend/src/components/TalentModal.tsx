import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes, FaTrash } from 'react-icons/fa';
import CpImageFill from './CpImageFill';
import { deleteTalent } from '../js/talentApi';

interface Props {
  open: boolean;
  initial?: any;
  skills?: any[];
  visuals?: any[];
  onClose: () => void;
  onSubmit: (data: any) => void | Promise<void>;
  onDeleteBinding?: () => void | Promise<void>;
  onDeleted?: (id: number) => void | Promise<void>;
}

const TalentModal: React.FC<Props> = ({ open, initial, skills, visuals, onClose, onSubmit, onDeleteBinding, onDeleted }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [file, setFile] = useState(initial?.file ?? '');
  const [iconQuery, setIconQuery] = useState('');
  const [selectedVisualId, setSelectedVisualId] = useState<number | ''>(initial?.visualId ?? '');
  const [selectedSkillId, setSelectedSkillId] = useState<number | ''>((initial?.skills && initial?.skills[0]) ? initial.skills[0].id : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDeleteTalentOpen, setConfirmDeleteTalentOpen] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setDescription(initial?.description ?? '');
    setIcon(initial?.icon ?? '');
    setFile(initial?.file ?? '');
    setSelectedSkillId((initial?.skills && initial?.skills[0]) ? initial.skills[0].id : '');
    setError(null);
  }, [open, initial]);

  const visualsFiltered = useMemo(() => {
    const q = (iconQuery || '').trim().toLowerCase();
    if (!q) return visuals || [];
    return (visuals || []).filter((v: any) => (v.name || '').toLowerCase().includes(q) || (v.model || '').toLowerCase().includes(q));
  }, [visuals, iconQuery]);

  function resolveVisualImage(v: any): string | undefined {
    if (!v) return undefined;
    return v.image || v.icon || v.model || v.file || v.path || undefined;
  }

  if (!open) return null;

  const BrokenLinkIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 13.5a3.5 3.5 0 0 1 0-4.95l1.06-1.06" />
      <path d="M13.5 10.5a3.5 3.5 0 0 1 0 4.95l-1.06 1.06" />
      <line x1="3" y1="21" x2="21" y2="3" />
    </svg>
  );

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ width: 640, maxWidth: '94vw' }}>
        <button className="icon option" title="Cerrar" onClick={onClose} aria-label="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
          <FaTimes size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>{initial?.id ? 'Editar Talento' : 'Nuevo Talento'}</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {initial?.id && onDeleteBinding ? (
                <button className="icon option" title="Eliminar vínculo" onClick={() => setConfirmOpen(true)} disabled={saving} aria-label="Eliminar vínculo" style={{ marginLeft: 8 }}>
                  <BrokenLinkIcon size={18} />
                </button>
              ) : null}
              {initial?.id ? (
                <button className="icon option" title="Eliminar talento" onClick={() => setConfirmDeleteTalentOpen(true)} disabled={saving} aria-label="Eliminar talento">
                  <FaTrash size={16} />
                </button>
              ) : null}
            </div>
        </div>

        {confirmOpen ? (
          <div className="modal-overlay" style={{ zIndex: 1300 }}>
            <div className="modal-content" style={{ maxWidth: 420 }}>
              <h2 className="modal-title">Confirmar eliminación</h2>
              <div style={{ marginBottom: 12 }}>¿Estás seguro de eliminar el vínculo de este talento en el árbol?</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button type="button" className="confirm" onClick={async () => {
                  try {
                    setSaving(true);
                    await onDeleteBinding!();
                    setConfirmOpen(false);
                    onClose();
                  } catch (err: any) {
                    setError(err?.message || 'Error eliminando vínculo');
                  } finally {
                    setSaving(false);
                  }
                }} disabled={saving} style={{ minWidth: 110 }}>{saving ? 'Confirmando...' : 'Confirmar'}</button>
                <button type="button" className="cancel" onClick={() => setConfirmOpen(false)} disabled={saving} style={{ minWidth: 110 }}>Cancelar</button>
              </div>
            </div>
          </div>
        ) : null}

        {confirmDeleteTalentOpen ? (
          <div className="modal-overlay" style={{ zIndex: 1300 }}>
            <div className="modal-content" style={{ maxWidth: 420 }}>
              <h2 className="modal-title">Eliminar talento</h2>
              <div style={{ marginBottom: 12 }}>Esta acción eliminará el talento y cualquier vínculo en los árboles. Para confirmar, escribe "eliminar" en el campo y pulsa Confirmar.</div>
              <div style={{ marginBottom: 12 }}>
                <input
                  value={confirmDeleteText}
                  onChange={(e) => setConfirmDeleteText(e.target.value)}
                  placeholder="Escribe 'eliminar' para confirmar"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button type="button" className="confirm" onClick={async () => {
                  if (!initial?.id) return;
                  if ((confirmDeleteText || '').trim().toLowerCase() !== 'eliminar') return;
                  try {
                    setSaving(true);
                    if (onDeleteBinding) await onDeleteBinding();
                    await deleteTalent(initial.id);
                    if (onDeleted) await onDeleted(initial.id);
                    setConfirmDeleteTalentOpen(false);
                    setConfirmDeleteText('');
                    onClose();
                  } catch (err: any) {
                    setError(err?.message || 'Error eliminando talento');
                  } finally {
                    setSaving(false);
                  }
                }} disabled={saving || (confirmDeleteText || '').trim().toLowerCase() !== 'eliminar'} style={{ minWidth: 110 }}>{saving ? 'Confirmando...' : 'Confirmar'}</button>
                <button type="button" className="cancel" onClick={() => { setConfirmDeleteTalentOpen(false); setConfirmDeleteText(''); }} disabled={saving} style={{ minWidth: 110 }}>Cancelar</button>
              </div>
            </div>
          </div>
        ) : null}

        <form onSubmit={async (e) => {
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
              file: file?.trim() || undefined,
              skillIds: selectedSkillId ? [selectedSkillId] : [],
            };
            await onSubmit(payload);
          } catch (err: any) {
            setError(err?.message || 'Error guardando');
          } finally {
            setSaving(false);
          }
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <label style={{ flex: 1 }}>
              Nombre
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={140} />
            </label>

            {!initial?.id && (
              <label style={{ width: 320 }}>
                Habilidad asociada
                <select value={String(selectedSkillId ?? '')} onChange={(e) => {
                  const v = e.target.value ? Number(e.target.value) : '';
                  setSelectedSkillId(v as any);
                  if (v) {
                    const chosen = (skills || []).find((s: any) => s.id === v);
                    if (chosen) {
                      if (!name) {
                        setName(chosen.name || '');
                        const skillDesc = chosen.description ? String(chosen.description) : '';
                        setDescription(`Aprende la habilidad ${chosen.name}.\n${skillDesc}`);
                      }
                      // adopt skill icon/file for the talent if available
                      if (chosen.icon) setIcon(chosen.icon);
                      else if (chosen.file) setIcon(chosen.file);
                    }
                  }
                }} style={{ width: '100%' }}>
                  <option value="">(ninguna)</option>
                  {(skills || []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
            )}
          </div>

          <label>
            Descripción
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: 80 }} />
          </label>

          <label>
            Icono
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="file" accept="image/*" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  setError(null);
                  const fd = new FormData();
                  fd.append('iconImage', f);
                  const res = await fetch('http://localhost:4000/talents/upload-icon', { method: 'POST', body: fd });
                  const payload = await res.json();
                  if (!res.ok) throw new Error(payload?.message || 'Upload failed');
                  setIcon(payload.icon ? String(payload.icon) : '');
                } catch (err: any) {
                  setError(err?.message || 'No se pudo subir la imagen');
                }
              }} />
            </div>
            <div style={{ marginTop: 8, width: 72, height: 72 }}>
              {icon ? <CpImageFill rawSrc={icon} alt="Icono" fit="cover" /> : <div style={{ opacity: 0.6 }}>Sin imagen</div>}
            </div>
          </label>

          {/* single skill select is placed next to Name above; removed multi-select duplicate */}

          {error ? <div style={{ color: '#e24444', fontSize: 13 }}>{error}</div> : null}

          <div className="actions">
            <button type="submit" className="confirm" disabled={saving}>{saving ? 'Confirmando...' : 'Confirmar'}</button>
            <button type="button" className="cancel" onClick={onClose} disabled={saving}>Cancelar</button>
            {/* delete-binding moved to header as icon */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TalentModal;
