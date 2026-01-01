import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaTrash, FaFlag } from 'react-icons/fa';
import { getSkillEffects, createSkillEffect, updateSkillEffect, deleteSkillEffect } from './skillEffectApi';

const SkillEffectsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try { const v = await getSkillEffects(); setItems((v as any) || []); setError(null); } catch (e: any) { setError(e?.message || 'Error'); }
  }

  useEffect(() => { refresh(); }, []);

  return (
    <div className="panel panel-corners-soft block-border block-panel-border">
      <div className="panel-header" style={{ position: 'relative' }}>
        <button className="icon" onClick={onBack} title="Volver"><FaArrowLeft size={22} color="#FFD700" /></button>
        <div style={{position:'absolute', left:'50%', transform:'translateX(-50%)', top:0, bottom:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{fontSize:12, opacity:0.85}}>Listado</div>
          <div style={{fontSize:22, fontWeight:900}}>Relaciones Habilidad-Efecto</div>
        </div>
        <button className="icon" title="Nuevo" onClick={async () => {
          const skillId = Number(window.prompt('skillId (número)')); if (!skillId) return;
          const effectId = Number(window.prompt('effectId (número)')); if (!effectId) return;
          const appliesTo = window.prompt('Aplica a (TARGET o CASTER)', 'TARGET') as 'TARGET' | 'CASTER';
          if (!appliesTo) return;
          await createSkillEffect({ skillId, effectId, appliesTo }); await refresh();
        }}><FaFlag size={22} color="#FFD700" /></button>
      </div>
      <div style={{ padding: 12 }}>
        {error ? <div style={{color:'#e2d9b7'}}>{error}</div> : null}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {items.map((it) => (
            <div key={it.id} className="block-border block-border-soft mechanic-card" style={{ padding: 12 }}>
              <div style={{ fontWeight: 900 }}>{(it.skill?.name || `Skill ${it.skill?.id}`)} → {(it.effect?.name || `Effect ${it.effect?.id}`)}</div>
              <div style={{ marginTop: 6, fontSize: 13 }}>{it.appliesTo}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button className="icon option" title="Editar" onClick={async () => {
                  const appliesTo = window.prompt('Aplica a (TARGET o CASTER)', it.appliesTo) as 'TARGET' | 'CASTER';
                  if (!appliesTo) return; await updateSkillEffect(it.id, { appliesTo }); await refresh();
                }}><FaEdit size={16} /></button>
                <button className="icon option" title="Eliminar" onClick={async () => { if (!window.confirm('Eliminar?')) return; await deleteSkillEffect(it.id); await refresh(); }}><FaTrash size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        {items.length === 0 ? <div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay relaciones.</div> : null}
      </div>
    </div>
  );
};

export default SkillEffectsView;
