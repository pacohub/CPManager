import React, { useCallback, useEffect, useState } from 'react';
import { FaArrowLeft, FaCompass } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import MapCard from '../components/MapCard';
import MapModal from '../components/MapModal';
import { MapItem } from '../interfaces/map';
import { createMap, deleteMap, getMapComponents, getMaps, updateMap } from './mapApi';

interface Props {
  onBack: () => void;
	onOpenMap: (id: number) => void;
}

const MapsView: React.FC<Props> = ({ onBack, onOpenMap }) => {
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [componentCountByMapId, setComponentCountByMapId] = useState<Record<number, number | undefined>>({});
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [initial, setInitial] = useState<Partial<MapItem> | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MapItem | null>(null);

  const refresh = useCallback(async () => {
    const list = await getMaps();
    const mapsList = list || [];
    setMaps(mapsList);

    // Fetch component counts per map for warnings (best-effort).
    Promise.allSettled(mapsList.map((m) => getMapComponents(m.id)))
      .then((results) => {
        const next: Record<number, number | undefined> = {};
        for (let i = 0; i < mapsList.length; i++) {
          const id = mapsList[i].id;
          const r = results[i];
          if (r.status === 'fulfilled') next[id] = (r.value || []).length;
        }
        setComponentCountByMapId(next);
      })
      .catch(() => {
        // Ignore count errors; we just won't show the missing-components warning.
        setComponentCountByMapId({});
      });
  }, []);

  useEffect(() => {
    refresh().catch((e) => console.error('Error cargando mapas', e));
  }, [refresh]);

  const filtered = (search.trim()
    ? maps.filter((m) => {
        const q = search.trim().toLowerCase();
        return (
          (m.name || '').toLowerCase().includes(q) ||
          (m.description || '').toLowerCase().includes(q)
        );
      })
    : maps
  ).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));

  return (
    <div className="panel panel-corners-soft block-border block-panel-border">
      <div className="panel-header">
        <button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
          <FaArrowLeft size={22} color="#FFD700" />
        </button>
        <h1 style={{ margin: 0 }}>Mapas</h1>
        <button
          className="icon"
          aria-label="Nuevo Mapa"
          title="Nuevo Mapa"
          onClick={() => {
            setInitial(undefined);
            setModalOpen(true);
          }}
        >
          <FaCompass size={22} color="#FFD700" />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px 12px 12px' }}>
        <input
          type="text"
          placeholder="Buscar mapa..."
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {filtered.map((m) => (
            <MapCard
              key={m.id}
              map={m}
              componentCount={componentCountByMapId[m.id]}
              onChanged={() => refresh().catch((e) => console.error('Error refrescando mapas', e))}
					onOpen={() => onOpenMap(m.id)}
              onEdit={() => {
                setInitial(m);
                setModalOpen(true);
              }}
              onDelete={() => {
                setPendingDelete(m);
                setConfirmOpen(true);
              }}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay mapas todavía.</div>
        ) : null}
      </div>

      {modalOpen ? (
        <MapModal
          open={modalOpen}
          initial={initial}
          existing={maps}
          onClose={() => {
            setModalOpen(false);
            setInitial(undefined);
          }}
			onSubmit={async (formData) => {
      if (initial?.id) await updateMap(initial.id, formData);
      else await createMap(formData);

            await refresh();
            setModalOpen(false);
            setInitial(undefined);
          }}
        />
      ) : null}

      <ConfirmModal
        open={confirmOpen}
        message={'¿Estás seguro de que deseas eliminar este mapa?'}
        onConfirm={async () => {
          const target = pendingDelete;
          setConfirmOpen(false);
          setPendingDelete(null);
          if (!target) return;
          await deleteMap(target.id);
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

export default MapsView;
