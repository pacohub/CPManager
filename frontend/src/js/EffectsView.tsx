import React, { useEffect, useState, useMemo } from 'react';
import { FaArrowLeft, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import { getEffects, createEffect, updateEffect, deleteEffect } from './effectApi';
import ClearableSearchInput from '../components/ClearableSearchInput';
import EffectModal from '../components/EffectModal';

const EffectsView: React.FC<{ onBack: () => void; onOpenEffect?: (id: number) => void }> = ({ onBack, onOpenEffect }) => {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<any | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [initial, setInitial] = useState<any | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const refresh = async () => {
    setError(null);
    try {
      const v = await getEffects();
      setItems((v as any) || []);
    } catch (e: any) {
      setError(e?.message || 'Error cargando efectos');
    }
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return items;
    return (items || []).filter((it) => (it.name || '').toLowerCase().includes(q) || (it.type || '').toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div className="panel panel-corners-soft block-border block-panel-border">
      <div className="panel-header" style={{ position: 'relative' }}>
        <button className="icon" onClick={onBack} title="Volver"><FaArrowLeft size={22} color="#FFD700" /></button>
        <div style={{position:'absolute', left:'50%', transform:'translateX(-50%)', top:0, bottom:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{fontSize:12, opacity:0.85}}>Listado</div>
          <div style={{fontSize:22, fontWeight:900}}>Efectos</div>
        </div>
        <button className="icon" title="Nuevo" onClick={() => { setInitial(undefined); setModalOpen(true); }}><FaStar size={22} color="#FFD700" /></button>
      </div>

      <div className="filters-bar" style={{ padding: 12 }}>
        <div className="filters-row">
          <ClearableSearchInput value={search} onChange={setSearch} placeholder="Buscar efecto..." className="filters-input" />
        </div>
      </div>

      {error ? <div style={{ padding: 12, color: '#e2d9b7' }}>{error}</div> : null}

      <div style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {filtered.map((it) => (
            <div
              key={it.id}
              className="block-border block-border-soft mechanic-card"
              style={{ padding: 12, position: 'relative', cursor: onOpenEffect ? 'pointer' : 'default' }}
              onMouseEnter={() => setHoveredId(it.id)}
              onMouseLeave={() => setHoveredId(undefined)}
              onClick={() => { if (onOpenEffect) onOpenEffect(it.id); }}
            >
              <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8, opacity: hoveredId === it.id ? 1 : 0, transition: 'opacity 0.18s' }}>
                <button className="icon option" title="Editar" onClick={(e) => { e.stopPropagation(); setInitial(it); setModalOpen(true); }}><FaEdit size={16} /></button>
                <button className="icon option" title="Eliminar" onClick={(e) => { e.stopPropagation(); setPendingDeleteId(it.id); setConfirmOpen(true); }}><FaTrash size={16} /></button>
              </div>

              <div style={{ fontWeight: 900 }}>{it.name}</div>
              {it.type ? <div style={{ marginTop: 6, fontSize: 13 }}>{it.type === 'benefit' ? 'Beneficio' : it.type === 'harm' ? 'Perjuicio' : it.type}</div> : null}
            </div>
          ))}
        </div>

        {filtered.length === 0 ? <div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay efectos.</div> : null}
      </div>
      {modalOpen ? (
        <EffectModal
          open={modalOpen}
          initial={initial}
          existing={items}
          onClose={() => { setModalOpen(false); setInitial(undefined); }}
          onSubmit={async (data) => {
            if (initial?.id) await updateEffect(initial.id, data);
            else await createEffect(data);
            await refresh();
            setModalOpen(false);
            setInitial(undefined);
          }}
        />
      ) : null}
      <ConfirmModal
        open={confirmOpen}
        requireText="eliminar"
        message={"¿Estás seguro de que deseas eliminar este efecto?"}
        onConfirm={async () => {
          if (pendingDeleteId !== null) {
            try {
              await deleteEffect(pendingDeleteId);
              await refresh();
            } catch (e) {
              console.error('Error eliminando efecto', e);
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

export default EffectsView;
