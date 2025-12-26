import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { MapItem } from '../interfaces/map';
import { RegionItem } from '../interfaces/region';
import { getRegions } from '../js/regionApi';

interface Props {
  open: boolean;
  initial?: Partial<MapItem>;
  existing: MapItem[];
  onSubmit: (data: FormData) => void;
  onClose: () => void;
}

const MapModal: React.FC<Props> = ({ open, initial, existing, onSubmit, onClose }) => {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [image, setImage] = useState<File | null>(null);
  const [fileLink, setFileLink] = useState(initial?.file || '');
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [selectedRegionIds, setSelectedRegionIds] = useState<number[]>([]);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name || '');
    setDescription(initial?.description || '');
    setImage(null);
    setFileLink(initial?.file || '');
    setError(null);
  }, [open, initial?.id, initial?.name, initial?.description, initial?.file]);

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
    const ids = (initial?.regions ?? []).map((r) => Number(r.id)).filter((n) => Number.isFinite(n));
    setSelectedRegionIds(ids);
  }, [open, initial?.regions]);

  const isDuplicateName = useMemo(() => {
    const normalized = name.trim().toLowerCase();
    if (!normalized) return false;
    return existing.some((m) => (m.name || '').trim().toLowerCase() === normalized && m.id !== initial?.id);
  }, [existing, name, initial?.id]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDuplicateName) {
      setError('Ya existe un mapa con ese nombre.');
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (image) formData.append('image', image);
    formData.append('file', fileLink.trim());
    formData.append('regionIds', JSON.stringify(selectedRegionIds));
    onSubmit(formData);
  };

  const previewUrl = image
    ? URL.createObjectURL(image)
    : initial?.image
      ? initial.image.startsWith('http') || initial.image.startsWith('data:')
        ? initial.image
        : `http://localhost:4000/${initial.image.replace(/^\/+/, '')}`
      : null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 520, minWidth: 340 }}>
        <button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
          <FaTimes size={18} />
        </button>
        <h2 className="modal-title" style={{ marginTop: 0 }}>{initial?.id ? 'Editar Mapa' : 'Nuevo Mapa'}</h2>

        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            name="name"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="off"
            style={isDuplicateName ? { borderColor: 'red' } : {}}
          />
          {isDuplicateName ? (
            <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Ya existe un mapa con ese nombre.</div>
          ) : null}

          <textarea
            name="description"
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            autoComplete="off"
          />

          <label style={{ marginBottom: 8, display: 'block' }}>
            Imagen:
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} style={{ display: 'block', marginTop: 4 }} />
            {initial?.image && !image ? (
              <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                Ruta actual: <span style={{ wordBreak: 'break-all' }}>{initial.image}</span>
              </div>
            ) : null}
          </label>

          {previewUrl ? (
            <div style={{ marginBottom: 8 }}>
              <img
                src={previewUrl}
                alt="Previsualización"
                style={{ maxWidth: '100%', maxHeight: 140, borderRadius: 8, border: '1px solid #ccc' }}
              />
            </div>
          ) : null}

          <label style={{ marginBottom: 8, display: 'block' }}>
            Archivo:
            <input
              type="url"
              placeholder="https://..."
              value={fileLink}
              onChange={(e) => setFileLink(e.target.value)}
              style={{ display: 'block', marginTop: 4 }}
            />
            {initial?.file ? (
              <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                Link actual: <span style={{ wordBreak: 'break-all' }}>{initial.file}</span>
              </div>
            ) : null}
          </label>

          <div style={{ marginBottom: 8 }}>
            <div style={{ marginBottom: 6 }}>Regiones:</div>
            <div style={{ maxHeight: 160, overflow: 'auto', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: 8 }}>
              {regions.length === 0 ? (
                <div style={{ opacity: 0.8, fontSize: 13 }}>No hay regiones creadas.</div>
              ) : (
                regions.map((r) => {
                  const checked = selectedRegionIds.includes(r.id);
                  return (
                    <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <input
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
                })
              )}
            </div>
          </div>

          <div className="actions">
            <button type="submit" className="confirm" disabled={isDuplicateName}>{initial?.id ? 'Actualizar' : 'Crear'}</button>
            <button type="button" className="cancel" onClick={onClose}>Cancelar</button>
          </div>

          {error ? <div style={{ color: 'red', marginTop: 8 }}>{error}</div> : null}
        </form>
      </div>
    </div>
  );
};

export default MapModal;
