import React, { useEffect, useState } from 'react';
import { FaPlus, FaTimes, FaStar } from 'react-icons/fa';
import EffectModal from './EffectModal';
import { createEffect } from '../js/effectApi';
import { createSkillEffect } from '../js/skillEffectApi';

interface Props {
  open: boolean;
  skillId: number;
  existing: any[];
  onClose: () => void;
  onDone: () => void;
  skillName?: string;
}

const AssociateEffectModal: React.FC<Props> = ({ open, skillId, existing, onClose, onDone, skillName }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [appliesTo, setAppliesTo] = useState<string>('TARGET');
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [effects, setEffects] = useState<any[]>(existing || []);

  useEffect(() => {
    if (!open) {
      setSelected(null);
      setAppliesTo('TARGET');
    }
  }, [open]);

  useEffect(() => {
    setEffects(existing || []);
    setSelected((existing && existing[0]) ? existing[0].id : null);
  }, [existing, open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ width: 640, maxWidth: '96vw' }}>
        <button className="icon option" title="Cerrar" onClick={onClose} aria-label="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
          <FaTimes size={18} />
        </button>
        <h2 style={{ marginTop: 0 }}>Asociar efecto</h2>

        {/* Removed top 'Aplica a' helper row per request */}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            Aplica a
            <select value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)}>
              <option value="TARGET">Target</option>
              <option value="CASTER">Caster</option>
              <option value="ZONAL_ALL">Zonal All</option>
              <option value="ZONAL_ENEMY">Zonal enemy</option>
              <option value="ZONAL_ALLY">Zonal ally</option>
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', flex: 2 }}>
            Efecto
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={selected ?? ''} onChange={(e) => setSelected(e.target.value ? Number(e.target.value) : null)} style={{ width: '100%' }}>
                <option value="">(seleccionar efecto)</option>
                {(effects || []).map((ef: any) => <option key={ef.id} value={ef.id}>{ef.name}</option>)}
              </select>
              <button className="icon" aria-label="Crear nuevo efecto" onClick={() => setCreateOpen(true)} style={{ color: 'inherit' }}>
                <FaStar />
              </button>
            </div>
          </label>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="confirm" disabled={!selected || creating} onClick={async () => {
            if (!selected) return;
            try {
              setCreating(true);
              await createSkillEffect({ skillId, effectId: selected, appliesTo });
              setCreating(false);
              onDone();
              onClose();
            } catch (err) { console.error(err); setCreating(false); }
          }}>{creating ? 'Confirmando...' : 'Confirmar'}</button>
          <button className="cancel" onClick={onClose} disabled={creating}>Cancelar</button>
        </div>

        {createOpen ? (
          <EffectModal
            open={createOpen}
            existing={existing}
            initial={{ name: skillName ?? '' }}
            onClose={() => setCreateOpen(false)}
            onSubmit={async (data) => {
              try {
                const created: any = await createEffect(data as any);
                if (created && created.id) {
                  setEffects((prev) => [ ...(prev || []), created ]);
                  setSelected(created.id);
                }
                setCreateOpen(false);
              } catch (err) { console.error(err); setCreateOpen(false); }
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

export default AssociateEffectModal;
