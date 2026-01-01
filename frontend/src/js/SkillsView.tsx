import React, { useEffect, useState, useMemo } from 'react';
import { FaArrowLeft, FaEdit, FaTrash, FaHandPaper } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import { getSkills, createSkill, updateSkill, deleteSkill } from './skillApi';
import ClearableSearchInput from '../components/ClearableSearchInput';
import CpImage from '../components/CpImage';
import SkillModal from '../components/SkillModal';
import { getVisualEffects } from './visualEffectApi';

const SkillsView: React.FC<{ onBack: () => void; onOpenSkill?: (id: number) => void }> = ({ onBack, onOpenSkill }) => {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [initial, setInitial] = useState<any | undefined>(undefined);
  const [visuals, setVisuals] = useState<any[]>([]);
  const [hoveredId, setHoveredId] = useState<any | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const refresh = async () => {
    setError(null);
    try {
      const v = await getSkills();
      setItems((v as any) || []);
    } catch (e: any) {
      setError(e?.message || 'Error cargando habilidades');
    }
  };

  useEffect(() => { refresh(); }, []);
  useEffect(() => { (async () => { try { const v = await getVisualEffects(); setVisuals(Array.isArray(v) ? v : []); } catch {} })(); }, []);

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return items;
    return (items || []).filter((it) => (it.name || '').toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div className="panel panel-corners-soft block-border block-panel-border">
      <div className="panel-header" style={{ position: 'relative' }}>
        <button className="icon" onClick={onBack} title="Volver"><FaArrowLeft size={22} color="#FFD700" /></button>
        <div style={{position:'absolute', left:'50%', transform:'translateX(-50%)', top:0, bottom:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{fontSize:12, opacity:0.85}}>Listado</div>
          <div style={{fontSize:22, fontWeight:900}}>Habilidades</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="icon" title="Actualizar habilidades de Blizzard" onClick={() => setImportConfirmOpen(true)} style={{ marginRight: 6 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={importing ? 'rotating' : ''}>
              <path d="M21 12a9 9 0 10-3 6.708" stroke="#FFD700" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 3v6h-6" stroke="#FFD700" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="icon" title="Nuevo" onClick={() => { setInitial(undefined); setModalOpen(true); }}><FaHandPaper size={22} color="#FFD700" /></button>
        </div>
      </div>

      <div className="filters-bar" style={{ padding: 12 }}>
        <div className="filters-row">
          <ClearableSearchInput value={search} onChange={setSearch} placeholder="Buscar habilidad..." className="filters-input" />
        </div>
      </div>

      {error ? <div style={{ padding: 12, color: '#e2d9b7' }}>{error}</div> : null}

      <div style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {filtered.map((it) => (
            <div
              key={it.id}
              className="block-border block-border-soft mechanic-card"
              style={{ padding: 12, position: 'relative', cursor: onOpenSkill ? 'pointer' : 'default' }}
              onMouseEnter={() => setHoveredId(it.id)}
              onMouseLeave={() => setHoveredId(undefined)}
              onClick={() => { if (onOpenSkill) onOpenSkill(it.id); }}
            >
              <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8, opacity: hoveredId === it.id ? 1 : 0, transition: 'opacity 0.18s' }}>
                <button className="icon option" title="Editar" onClick={(e) => { e.stopPropagation(); setInitial(it); setModalOpen(true); }}><FaEdit size={16} /></button>
                <button className="icon option" title="Eliminar" onClick={(e) => { e.stopPropagation(); setPendingDeleteId(it.id); setConfirmOpen(true); }}><FaTrash size={16} /></button>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <CpImage rawSrc={it.icon} width={64} height={64} fit="cover" frameClassName="metallic-border metallic-border-square" />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900 }}>{it.name}</div>
                  {it.levels ? <div style={{ marginTop: 6, fontSize: 13 }}>Niveles: {it.levels}</div> : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? <div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay habilidades.</div> : null}
      </div>
      {modalOpen ? (
        <SkillModal
          open={modalOpen}
          initial={initial}
          visuals={visuals}
          onClose={() => { setModalOpen(false); setInitial(undefined); }}
          onSubmit={async (data) => {
            if (initial?.id) await updateSkill(initial.id, data);
            else await createSkill(data);
            await refresh();
            setModalOpen(false);
            setInitial(undefined);
          }}
        />
      ) : null}
      <ConfirmModal
        open={confirmOpen}
        requireText="eliminar"
        message={"¿Estás seguro de que deseas eliminar esta habilidad?"}
        onConfirm={async () => {
          if (pendingDeleteId !== null) {
            try {
              await deleteSkill(pendingDeleteId);
              await refresh();
            } catch (e) {
              console.error('Error eliminando habilidad', e);
            }
            setPendingDeleteId(null);
          }
          setConfirmOpen(false);
        }}
        onCancel={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
      />
      <ConfirmModal
        open={importConfirmOpen}
        requireText="actualizar"
        message={"¿Descargar y añadir a la base de datos las habilidades de Blizzard que falten?"}
        onConfirm={async () => {
          setImportConfirmOpen(false);
          setImporting(true);
          try {
            const res = await fetch('http://localhost:4000/skills/import-blizzard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
            const j = await res.json();
            if (!res.ok || !j?.ok) {
              console.error('Import failed', j);
              setError(j?.error || 'Error importando habilidades');
            } else {
              // refresh list
              await refresh();
            }
          } catch (e: any) {
            console.error('Import error', e);
            setError(e?.message || 'Error importando habilidades');
          } finally {
            setImporting(false);
          }
        }}
        onCancel={() => { setImportConfirmOpen(false); }}
      />
    </div>
  );
};

export default SkillsView;
