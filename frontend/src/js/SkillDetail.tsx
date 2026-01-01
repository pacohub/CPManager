import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import SkillModal from '../components/SkillModal';
import { getSkill, updateSkill, deleteSkill } from './skillApi';
import { getVisualEffects } from './visualEffectApi';
import { getSkillEffects, createSkillEffect, updateSkillEffect, deleteSkillEffect } from './skillEffectApi';
import { getEffects } from './effectApi';
import { useNavigate } from 'react-router-dom';
import CpImage from '../components/CpImage';

function renderAppliesToLabel(code?: string) {
  switch (code) {
    case 'CASTER': return 'Caster';
    case 'ZONAL_ALL': return 'Zonal All';
    case 'ZONAL_ENEMY': return 'Zonal enemy';
    case 'ZONAL_ALLY': return 'Zonal ally';
    case 'TARGET':
    default:
      return 'Target';
  }
}

const SkillDetail: React.FC<{ skillId: number; onBack: () => void }> = ({ skillId, onBack }) => {
  const [item, setItem] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [visuals, setVisuals] = useState<any[]>([]);
  const [effects, setEffects] = useState<any[]>([]);
  const [skillEffects, setSkillEffects] = useState<any[]>([]);
  const [newEffectId, setNewEffectId] = useState<number | null>(null);
  const [newAppliesTo, setNewAppliesTo] = useState<string>('TARGET');
  const [pendingDeleteSkillEffectId, setPendingDeleteSkillEffectId] = useState<number | null>(null);
  const [editingSkillEffectId, setEditingSkillEffectId] = useState<number | null>(null);
  const [editingAppliesToValue, setEditingAppliesToValue] = useState<string>('TARGET');
  const navigate = useNavigate();

  const refresh = async () => {
    setError(null);
    try {
      const payload = await getSkill(skillId);
      setItem(payload as any);
      try { const v = await getVisualEffects(); setVisuals(Array.isArray(v) ? v : []); } catch {}
      try { const eff = await getEffects(); setEffects(Array.isArray(eff) ? eff : []); } catch {}
      try { const all = await getSkillEffects(); setSkillEffects((Array.isArray(all) ? all : []).filter((se: any) => se.skill?.id === skillId)); } catch {}
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar');
    }
  };

  useEffect(() => { refresh(); }, [skillId]);

  return (
    <div className="panel panel-corners-soft block-border block-panel-border">
      <div className="panel-header" style={{ position: 'relative' }}>
        <button className="icon" onClick={onBack} title="Volver" aria-label="Volver"><FaArrowLeft size={22} color="#FFD700" /></button>
        <div style={{position:'absolute', left:'50%', transform:'translateX(-50%)', top:0, bottom:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{fontSize:12, opacity:0.85}}>Habilidad</div>
          <div style={{fontSize:22, fontWeight:900}}>{item?.name ?? 'Habilidad'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="icon" title="Editar" aria-label="Editar" onClick={() => setEditOpen(true)} disabled={!item}><FaEdit size={18} color="#FFD700" /></button>
          <button className="icon" title="Eliminar" aria-label="Eliminar" onClick={() => setConfirmOpen(true)} disabled={!item}><FaTrash size={18} color="#FFD700" /></button>
        </div>
      </div>

      <div style={{ padding: 12 }}>
        {error ? <div style={{ color: '#e24444' }}>{error}</div> : null}
        {!item ? <div>Cargando...</div> : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {item.icon ? <CpImage rawSrc={item.icon} width={64} height={64} fit="cover" frameClassName="metallic-border metallic-border-square" /> : null}
              <div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{item.name}</div>
                <div style={{ opacity: 0.9 }}>Levels: {item.levels ?? '-'}</div>
              </div>
            </div>
            {item.description ? <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{item.description}</div> : null}
            {item.casterVisual?.name ? <div style={{ marginTop: 8 }}>Visual de lanzamiento: {item.casterVisual.name}</div> : null}
            {item.missileVisual?.name ? <div style={{ marginTop: 8 }}>Visual de proyectil: {item.missileVisual.name}</div> : null}
            {item.targetVisual?.name ? <div style={{ marginTop: 8 }}>Visual de objetivo: {item.targetVisual.name}</div> : null}
          </div>
        )}
      </div>

      {editOpen && item ? (
        <SkillModal
          open={editOpen}
          initial={item}
          visuals={visuals}
          onClose={() => setEditOpen(false)}
          onSubmit={async (data) => {
            await updateSkill(item.id, data);
            setEditOpen(false);
            await refresh();
          }}
        />
      ) : null}

      <div style={{ padding: 12 }} className="block-border block-border-soft">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 900 }}>Efectos asociados</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={newAppliesTo} onChange={(e) => setNewAppliesTo(e.target.value)}>
              <option value="TARGET">Target</option>
              <option value="CASTER">Caster</option>
              <option value="ZONAL_ALL">Zonal All</option>
              <option value="ZONAL_ENEMY">Zonal enemy</option>
              <option value="ZONAL_ALLY">Zonal ally</option>
            </select>
            <select value={newEffectId ?? ''} onChange={(e) => setNewEffectId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">(seleccionar efecto)</option>
              {(effects || []).map((ef: any) => <option key={ef.id} value={ef.id}>{ef.name}</option>)}
            </select>
            <button className="icon" title="Añadir" onClick={async () => {
              if (!newEffectId) return;
              try {
                await createSkillEffect({ skillId: skillId, effectId: newEffectId, appliesTo: newAppliesTo });
                setNewEffectId(null);
                await refresh();
              } catch (err) { console.error(err); }
            }}><FaPlus size={16} color="#FFD700" /></button>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          {(skillEffects || []).map((se) => (
            <div key={se.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{se.effect?.name ?? '—'}</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>{renderAppliesToLabel(se.appliesTo)}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {editingSkillEffectId === se.id ? (
                  <>
                    <select value={editingAppliesToValue} onChange={(e) => setEditingAppliesToValue(e.target.value)}>
                      <option value="TARGET">Target</option>
                      <option value="CASTER">Caster</option>
                      <option value="ZONAL_ALL">Zonal All</option>
                      <option value="ZONAL_ENEMY">Zonal enemy</option>
                      <option value="ZONAL_ALLY">Zonal ally</option>
                    </select>
                    <button className="icon option" title="Confirmar" onClick={async () => {
                      try {
                        await updateSkillEffect(se.id, { appliesTo: editingAppliesToValue });
                        setEditingSkillEffectId(null);
                        await refresh();
                      } catch (err) { console.error(err); }
                    }}>
                      <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24"><path fill="#FFD700" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
                    </button>
                    <button className="icon option" title="Cancelar" onClick={() => setEditingSkillEffectId(null)}><FaTimes size={16} color="#FFD700" /></button>
                  </>
                ) : (
                  <>
                    <button className="icon option" title="Editar" onClick={() => { setEditingSkillEffectId(se.id); setEditingAppliesToValue(se.appliesTo); }}><FaEdit size={16} color="#FFD700" /></button>
                    <button className="icon option" title="Eliminar" onClick={() => setPendingDeleteSkillEffectId(se.id)}>
                      <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24"><path fill="#FFD700" d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9Z"/></svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {(skillEffects || []).length === 0 ? <div style={{ opacity: 0.8 }}>No hay efectos asociados.</div> : null}
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        requireText="eliminar"
        message={'¿Estás seguro de que deseas eliminar esta habilidad?'}
        onConfirm={async () => {
          setConfirmOpen(false);
          if (!item) return;
          await deleteSkill(item.id);
          onBack();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
      <ConfirmModal
        open={Boolean(pendingDeleteSkillEffectId)}
        requireText="eliminar"
        message={'¿Eliminar esta asociación de efecto?'}
        onConfirm={async () => {
          const id = pendingDeleteSkillEffectId;
          setPendingDeleteSkillEffectId(null);
          if (!id) return;
          await deleteSkillEffect(id);
          await refresh();
        }}
        onCancel={() => setPendingDeleteSkillEffectId(null)}
      />
    </div>
  );
};

export default SkillDetail;
