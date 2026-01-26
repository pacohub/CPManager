import React, { useEffect, useState, useMemo } from 'react';
import { FaArrowLeft, FaEdit, FaTrash, FaHandPaper, FaExclamation } from 'react-icons/fa';
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
  const [lastImport, setLastImport] = useState<any>(null);

  const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  const formatRelative = (ts: number) => {
    const diff = Date.now() - ts;
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `hace ${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `hace ${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `hace ${hr}h`;
    const days = Math.floor(hr / 24);
    if (days < 30) return `hace ${days}d`;
    const months = Math.floor(days / 30);
    return `hace ${months}m`;
  };

  const hexToRgb = (hex: string) => {
    const h = hex.replace('#', '');
    return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
  };
  const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };
  const computeColorFor = (ts: number) => {
    const base = hexToRgb('#e2d9b7');
    const target = { r: 255, g: 0, b: 0 };
    const month = 30 * 24 * 60 * 60 * 1000;
    const age = Date.now() - ts;
    const t = Math.max(0, Math.min(1, age / month));
    const r = base.r + (target.r - base.r) * t;
    const g = base.g + (target.g - base.g) * t;
    const b = base.b + (target.b - base.b) * t;
    return rgbToHex(r, g, b);
  };

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
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/skills/last-import`);
        const j = await res.json();
        if (j?.ok && j.info) setLastImport(j.info);
      } catch {}
    })();
  }, []);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {lastImport ? <div style={{ fontSize: 12, color: computeColorFor(lastImport.ts) }} title={new Date(lastImport.ts).toLocaleString()}>Última importación: {formatRelative(lastImport.ts)}</div> : null}
          </div>
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
          {filtered.map((it) => {
            const missing: string[] = [];
            if (!((it.icon || '') + '').trim()) missing.push('icono');
            const showWarning = missing.length > 0;
            const warningText = `Falta: ${missing.join(', ')}.`;

            return (
              <div
                key={it.id}
                className="block-border block-border-soft mechanic-card"
                style={{ padding: 12, position: 'relative', cursor: onOpenSkill ? 'pointer' : 'default' }}
                onMouseEnter={() => setHoveredId(it.id)}
                onMouseLeave={() => setHoveredId(undefined)}
                onClick={() => { if (onOpenSkill) onOpenSkill(it.id); }}
              >
                {/* ...eliminado warning visual... */}

                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8, opacity: hoveredId === it.id ? 1 : 0, transition: 'opacity 0.18s' }}>
                  <button className="icon option" title="Editar" onClick={(e) => { e.stopPropagation(); setInitial(it); setModalOpen(true); }}><FaEdit size={16} /></button>
                  <button className="icon option" title="Eliminar" onClick={(e) => { e.stopPropagation(); setPendingDeleteId(it.id); setConfirmOpen(true); }}><FaTrash size={16} /></button>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <CpImage rawSrc={it.icon} width={64} height={64} fit="cover" frameClassName={it.passive ? 'metallic-border metallic-border-square passive-inner' : 'metallic-border metallic-border-square'} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900 }}>{it.name}</div>
                    {it.levels ? <div style={{ marginTop: 6, fontSize: 13 }}>Niveles: {it.levels}</div> : null}
                  </div>
                </div>
              </div>
            );
          })}
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
            const res = await fetch(`${apiBase}/skills/import-blizzard`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
            const j = await res.json();
            if (!res.ok || !j?.ok) {
              console.error('Import failed', j);
              setError(j?.error || 'Error importando habilidades');
            } else {
              // refresh list
              await refresh();
              // refresh last-import info
              try { const r2 = await fetch(`${apiBase}/skills/last-import`); const j2 = await r2.json(); if (j2?.ok && j2.info) setLastImport(j2.info); } catch {}
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
