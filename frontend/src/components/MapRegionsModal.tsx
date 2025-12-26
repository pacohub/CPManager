import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { MapItem } from '../interfaces/map';
import { RegionItem } from '../interfaces/region';
import { updateMap } from '../js/mapApi';
import { getRegions } from '../js/regionApi';

interface Props {
  open: boolean;
  map: MapItem;
  onClose: () => void;
  onSaved?: () => void;
}

const MapRegionsModal: React.FC<Props> = ({ open, map, onClose, onSaved }) => {
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [selectedRegionIds, setSelectedRegionIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const ids = (map.regions ?? []).map((r) => Number(r.id)).filter((n) => Number.isFinite(n));
    setSelectedRegionIds(ids);
  }, [open, map.id, map.regions]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await getRegions();
        if (cancelled) return;
        const sorted = (list ?? []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
        setRegions(sorted);
      } catch (e) {
        if (cancelled) return;
        console.error('Error cargando regiones', e);
        setRegions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setSearch('');
  }, [open, map.id]);

  const filteredRegions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return regions;
    return regions.filter((r) => (r.name || '').toLowerCase().includes(q));
  }, [regions, search]);

  const regionsTitle = useMemo(() => {
    const selectedNames = regions.filter((r) => selectedRegionIds.includes(r.id)).map((r) => r.name).filter(Boolean);
    return selectedNames.length ? selectedNames.join(', ') : 'Sin regiones';
  }, [regions, selectedRegionIds]);

  if (!open) return null;


  return createPortal(
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Asociar regiones">
      <div className="modal-content" style={{ maxWidth: 520, minWidth: 340 }}>
        <button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
          <FaTimes size={18} />
        </button>
        <h2 className="modal-title" style={{ marginTop: 0 }}>Asociar regiones</h2>
        <div style={{ opacity: 0.9, fontSize: 13, marginBottom: 10 }}>
          Mapa: <strong>{map.name}</strong>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ marginBottom: 6 }}>Regiones:</div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <input
              type="text"
              placeholder="Buscar región..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, padding: 8 }}
            />
          </div>
          <div style={{ maxHeight: 240, overflow: 'auto', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: 8 }}>
            {filteredRegions.length === 0 ? (
              <div style={{ opacity: 0.8, fontSize: 13 }}>No hay regiones creadas.</div>
            ) : (
              <div className="region-pick-list">
                {filteredRegions.map((r) => {
                  const checked = selectedRegionIds.includes(r.id);
                  return (
                    <label key={r.id} className="region-pick-item" title={r.description || ''}>
                      <input
                        className="region-pick-checkbox"
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked;
                          setSelectedRegionIds((prev) => {
                            if (next) return prev.includes(r.id) ? prev : prev.concat(r.id);
                            return prev.filter((x) => x !== r.id);
                          });
                        }}
                      />
                      <span>{r.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ marginTop: 8, opacity: 0.85, fontSize: 13 }}>
            Seleccionadas: {regionsTitle}
          </div>
        </div>

        <div className="actions">
          <button
            type="button"
            className="confirm"
            disabled={saving}
            onClick={async () => {
              try {
                setSaving(true);
                const formData = new FormData();
                formData.append('name', map.name);
                formData.append('description', map.description ?? '');
                if (map.file !== undefined) formData.append('file', map.file ?? '');
                formData.append('regionIds', JSON.stringify(selectedRegionIds));
                await updateMap(map.id, formData);
                onSaved?.();
                onClose();
              } catch (e) {
                console.error('Error guardando regiones del mapa', e);
              } finally {
                setSaving(false);
              }
            }}
          >
            Guardar
          </button>
          <button type="button" className="cancel" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default MapRegionsModal;
