import React, { useEffect, useState, useMemo } from 'react';
import { FaArrowLeft, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import { getVisualEffects, createVisualEffect, updateVisualEffect, deleteVisualEffect } from './visualEffectApi';
import { getSounds } from './soundApi';
import ClearableSearchInput from '../components/ClearableSearchInput';
import VisualEffectModal from '../components/VisualEffectModal';

interface Props { onBack: () => void; }

const VisualEffectsView: React.FC<Props> = ({ onBack }) => {
  const [items, setItems] = useState<any[]>([]);
  const [sounds, setSounds] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [initial, setInitial] = useState<any | undefined>(undefined);
  const [hoveredId, setHoveredId] = useState<any | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const refresh = async () => {
    setError(null);
    try {
      const [v, s] = await Promise.all([getVisualEffects(), getSounds()]);
      setItems((v as any) || []);
      setSounds((s as any) || []);
    } catch (e: any) {
      setError(e?.message || 'Error cargando datos');
    }
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return items;
    return (items || []).filter((it) => (it.name || '').toLowerCase().includes(q) || (it.model || '').toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div className="panel panel-corners-soft block-border block-panel-border">
      <div className="panel-header" style={{ position: 'relative' }}>
        <button className="icon" onClick={onBack} title="Volver"><FaArrowLeft size={22} color="#FFD700" /></button>
        <div style={{position:'absolute', left:'50%', transform:'translateX(-50%)', top:0, bottom:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{fontSize:12, opacity:0.85}}>Listado</div>
          <div style={{fontSize:22, fontWeight:900}}>Efectos Visuales</div>
        </div>
        <button className="icon" title="Nuevo" onClick={() => { setInitial(undefined); setModalOpen(true); }}>
          <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
            <FaStar size={14} color="#FFD700" />
            <FaStar size={14} color="#FFD700" />
            <FaStar size={14} color="#FFD700" />
          </span>
        </button>
      </div>

      <div className="filters-bar" style={{ padding: 12 }}>
        <div className="filters-row">
          <ClearableSearchInput value={search} onChange={setSearch} placeholder="Buscar efecto visual..." className="filters-input" />
        </div>
      </div>

      {error ? <div style={{ padding: 12, color: '#e2d9b7' }}>{error}</div> : null}

      <div style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {filtered.map((it) => (
            <div
              key={it.id}
              className="block-border block-border-soft mechanic-card"
              style={{ padding: 12, position: 'relative' }}
              onMouseEnter={() => setHoveredId(it.id)}
              onMouseLeave={() => setHoveredId(undefined)}
            >
              <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8, opacity: hoveredId === it.id ? 1 : 0, transition: 'opacity 0.18s' }}>
                <button className="icon option" title="Editar" onClick={() => { setInitial(it); setModalOpen(true); }}><FaEdit size={16} /></button>
                <button className="icon option" title="Eliminar" onClick={() => { setPendingDeleteId(it.id); setConfirmOpen(true); }}><FaTrash size={16} /></button>
              </div>

              <div style={{ fontWeight: 900, wordBreak: 'break-word' }}>{it.name}</div>
              {it.model ? <div style={{ marginTop: 6, opacity: 0.9 }}>{it.model}</div> : null}
              {it.sound?.name ? <div style={{ marginTop: 6, fontSize: 13 }}>Sonido: {it.sound.name}</div> : null}
            </div>
          ))}
        </div>

        {filtered.length === 0 ? <div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay efectos visuales.</div> : null}
      </div>

      {modalOpen ? (
        <VisualEffectModal
          open={modalOpen}
          initial={initial}
          sounds={sounds}
          existing={items}
          onClose={() => { setModalOpen(false); setInitial(undefined); }}
          onCreateSound={async (name) => {
            // fallback: create sound via simple API if implemented; reuse existing Sound API
            const res = await fetch('http://localhost:4000/sounds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
            if (!res.ok) throw new Error('No se pudo crear el sonido');
            await refresh();
          }}
          onSubmit={async (data) => {
            if (initial?.id) await updateVisualEffect(initial.id, data);
            else await createVisualEffect(data);
            await refresh();
            setModalOpen(false);
            setInitial(undefined);
          }}
        />
      ) : null}
      <ConfirmModal
        open={confirmOpen}
        requireText="eliminar"
        message={"¿Estás seguro de que deseas eliminar este efecto visual?"}
        onConfirm={async () => {
          if (pendingDeleteId !== null) {
            try {
              await deleteVisualEffect(pendingDeleteId);
              await refresh();
            } catch (e) {
              console.error('Error eliminando efecto visual', e);
            }
            setPendingDeleteId(null);
          }
          setConfirmOpen(false);
        }}
        onCancel={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
      />
    </div>
  );
};

export default VisualEffectsView;
