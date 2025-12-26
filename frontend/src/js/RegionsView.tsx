import React, { useCallback, useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaExclamationTriangle, FaGlobe, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import RegionModal from '../components/RegionModal';
import { RegionItem } from '../interfaces/region';
import { createRegion, deleteRegion, getRegions, updateRegion } from './regionApi';

interface Props {
  onBack: () => void;
}

const RegionsView: React.FC<Props> = ({ onBack }) => {
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [initial, setInitial] = useState<Partial<RegionItem> | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<RegionItem | null>(null);

  const refresh = useCallback(async () => {
    const list = await getRegions();
    setRegions(list || []);
  }, []);

  useEffect(() => {
    refresh().catch((e) => console.error('Error cargando regiones', e));
  }, [refresh]);

  const filtered = (search.trim()
    ? regions.filter((r) => {
        const q = search.trim().toLowerCase();
        return ((r.name || '').toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q));
      })
    : regions
  ).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));

  return (
    <div className="panel panel-corners-soft block-border block-panel-border">
      <div className="panel-header">
        <button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
          <FaArrowLeft size={22} color="#FFD700" />
        </button>
        <h1 style={{ margin: 0 }}>Regiones</h1>
        <button
          className="icon"
          aria-label="Nueva Región"
          title="Nueva Región"
          onClick={() => {
            setInitial(undefined);
            setModalOpen(true);
          }}
        >
          <FaGlobe size={22} color="#FFD700" />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px 12px 12px' }}>
        <input
          type="text"
          placeholder="Buscar región..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
      </div>
      {search.trim() ? (
        <div style={{ marginTop: -8, marginBottom: 16, opacity: 0.9, fontSize: 13, padding: '0 12px' }}>
          Resultados: {filtered.length}
        </div>
      ) : null}

      <div style={{ padding: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ opacity: 0.8, color: '#e2d9b7' }}>No hay regiones todavía.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((r) => (
              <div key={r.id} className="block-border block-border-soft" style={{ padding: 12, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, minWidth: 0, wordBreak: 'break-word' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <span style={{ minWidth: 0 }}>{r.name}</span>
                        {(() => {
                          const missing: string[] = [];
                          if (!String(r.description ?? '').trim()) missing.push('descripción');
                          if (!String(r.link ?? '').trim()) missing.push('link');
                          if (missing.length === 0) return null;
                          const warningText = `Falta: ${missing.join(', ')}.`;
                          return (
                            <span className="saga-warning" title={warningText} aria-label={warningText}>
                              <FaExclamationTriangle size={14} />
                            </span>
                          );
                        })()}
                      </span>
                      {String(r.description ?? '').trim() ? (
                        <>
                          : <span style={{ fontWeight: 400, opacity: 0.9 }}>{r.description}</span>
                        </>
                      ) : null}
                    </div>
                    {r.link ? (
                      <div style={{ marginTop: 6, fontSize: 13 }}>
                        <a href={r.link} target="_blank" rel="noopener noreferrer">{r.link}</a>
                      </div>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <button
                      className="icon option"
                      title="Editar"
                      onClick={() => {
                        setInitial(r);
                        setModalOpen(true);
                      }}
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      className="icon option"
                      title="Eliminar"
                      onClick={() => {
                        setPendingDelete(r);
                        setConfirmOpen(true);
                      }}
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen ? (
        <RegionModal
          open={modalOpen}
          initial={initial}
          onClose={() => {
            setModalOpen(false);
            setInitial(undefined);
          }}
          onSubmit={async (data) => {
            if (initial?.id) await updateRegion(initial.id, data);
            else await createRegion(data as any);
            await refresh();
            setModalOpen(false);
            setInitial(undefined);
          }}
        />
      ) : null}

      <ConfirmModal
        open={confirmOpen}
        message={'¿Estás seguro de que deseas eliminar esta región?'}
        onConfirm={async () => {
          const target = pendingDelete;
          setConfirmOpen(false);
          setPendingDelete(null);
          if (!target) return;
          await deleteRegion(target.id);
          await refresh();
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
      />
    </div>
  );
};

export default RegionsView;
