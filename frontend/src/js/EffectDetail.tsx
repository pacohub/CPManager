import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import EffectModal from '../components/EffectModal';
import { getEffects, getEffect, updateEffect, deleteEffect } from './effectApi';

function asImageUrl(raw?: string): string | undefined {
  const v = (raw || '').trim();
  if (!v) return undefined;
  if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
  if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
  return undefined;
}

const EffectDetail: React.FC<{ effectId: number; onBack: () => void }> = ({ effectId, onBack }) => {
  const [item, setItem] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const refresh = async () => {
    setError(null);
    try {
      const payload = await getEffect(effectId);
      setItem(payload as any);
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar');
    }
  };

  useEffect(() => { refresh(); }, [effectId]);

  return (
    <div className="panel panel-corners-soft block-border block-panel-border">
      <div className="panel-header" style={{ position: 'relative' }}>
        <button className="icon" onClick={onBack} title="Volver" aria-label="Volver"><FaArrowLeft size={22} color="#FFD700" /></button>
        <div style={{position:'absolute', left:'50%', transform:'translateX(-50%)', top:0, bottom:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{fontSize:12, opacity:0.85}}>Efecto</div>
          <div style={{fontSize:22, fontWeight:900}}>{item?.name ?? 'Efecto'}</div>
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
            <div style={{ fontWeight: 900, fontSize: 18 }}>{item.name}</div>
            {item.description ? <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{item.description}</div> : null}
            {item.type ? <div style={{ marginTop: 8, opacity: 0.9 }}>Tipo: {item.type === 'benefit' ? 'Beneficio' : item.type === 'harm' ? 'Perjuicio' : item.type}</div> : null}
            {item.visualEffect?.name ? <div style={{ marginTop: 8 }}>Efecto visual: {item.visualEffect.name}</div> : null}
            {item.file ? <div style={{ marginTop: 8 }}>Archivo: {item.file}</div> : null}
          </div>
        )}
      </div>

      {editOpen && item ? (
        <EffectModal
          open={editOpen}
          initial={item}
          existing={[]}
          onClose={() => setEditOpen(false)}
          onSubmit={async (data) => {
            await updateEffect(item.id, data);
            setEditOpen(false);
            await refresh();
          }}
        />
      ) : null}

      <ConfirmModal
        open={confirmOpen}
        requireText="eliminar"
        message={'¿Estás seguro de que deseas eliminar este efecto?'}
        onConfirm={async () => {
          setConfirmOpen(false);
          if (!item) return;
          await deleteEffect(item.id);
          onBack();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default EffectDetail;
