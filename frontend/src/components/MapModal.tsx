import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { MapItem } from '../interfaces/map';
import CpImageFill from './CpImageFill';

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
  const [removeImage, setRemoveImage] = useState(false);
  const [fileLink, setFileLink] = useState(initial?.file || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name || '');
    setDescription(initial?.description || '');
    setImage(null);
    setRemoveImage(false);
    setFileLink(initial?.file || '');
    setError(null);
  }, [open, initial?.id, initial?.name, initial?.description, initial?.file]);

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
    else if (removeImage) formData.append('image', '');
    formData.append('file', fileLink.trim());
		onSubmit(formData);
  };

  const previewUrl = removeImage
    ? null
    : image
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
          {/* removal will be handled by overlay button on the preview (top-right) */}

            {previewUrl ? (
            <div style={{ marginBottom: 8 }} className="preview-container">
              <div style={{ width: '100%', height: 140, borderRadius: 8, border: '1px solid #ccc', overflow: 'hidden', position: 'relative' }}>
                {initial?.id && initial?.image && !image ? (
                  <button
                    type="button"
                    className="preview-remove-btn top-right"
                    data-tooltip="Eliminar imagen"
                    aria-label="Eliminar imagen"
                    onClick={() => {
                      setImage(null);
                      setRemoveImage(true);
                    }}
                  >
                    <FaTimes size={16} />
                  </button>
                ) : null}
                <CpImageFill alt="Previsualización" src={previewUrl} />
              </div>
              {removeImage ? <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6 }}>Se eliminará al guardar.</div> : null}
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

          <div className="actions">
            <button type="submit" className="confirm" disabled={isDuplicateName}>Confirmar</button>
            <button type="button" className="cancel" onClick={onClose}>Cancelar</button>
          </div>

          {error ? <div style={{ color: 'red', marginTop: 8 }}>{error}</div> : null}
        </form>
      </div>
    </div>
  );
};

export default MapModal;
