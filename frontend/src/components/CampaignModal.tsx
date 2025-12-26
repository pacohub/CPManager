import React, { useEffect, useState } from 'react';
import { Campaign } from '../interfaces/campaign';
import { FaTimes } from 'react-icons/fa';

interface Props {
  open: boolean;
  initial?: Partial<Campaign>;
  onSubmit: (data: FormData) => void;
  onClose: () => void;
  campaigns: Campaign[];
}


const CampaignModal: React.FC<Props> = ({ open, initial, onSubmit, onClose, campaigns }) => {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [image, setImage] = useState<File | null>(null);
  const [fileLink, setFileLink] = useState(initial?.file || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name || '');
    setDescription(initial?.description || '');
    setImage(null);
    setFileLink(initial?.file || '');
    setError(null);
  }, [open, initial?.id, initial?.name, initial?.description, initial?.file]);



  if (!open) return null;

  const isDuplicateName = campaigns.some((c: Campaign) => c.name?.trim().toLowerCase() === name.trim().toLowerCase() && c.id !== initial?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDuplicateName) {
      setError('Ya existe una campaña con ese nombre.');
      return;
    }
    setError(null);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (image) formData.append('image', image);
    formData.append('file', fileLink.trim());
    if (initial?.sagaId) formData.append('sagaId', String(initial.sagaId));
    if (initial?.order !== undefined) formData.append('order', String(initial.order));
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 480, minWidth: 340 }}>
        <button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
          <FaTimes size={18} />
        </button>
        <h2 className="modal-title" style={{ marginTop: 0 }}>
          {initial?.id ? 'Editar Campaña' : 'Nueva Campaña'}
        </h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            name="name"
            placeholder="Nombre"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoComplete="off"
            style={isDuplicateName ? { borderColor: 'red' } : {}}
          />
          {isDuplicateName && (
            <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Ya existe una campaña con ese nombre.</div>
          )}
          <textarea
            name="description"
            placeholder="Descripción"
            value={description}
            onChange={e => setDescription(e.target.value)}
            autoComplete="off"
          />
          <label style={{ marginBottom: 8, display: 'block' }}>
            Imagen:
            <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} style={{ display: 'block', marginTop: 4 }} />
            {initial?.image && !image && (
              <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                Ruta actual: <span style={{ wordBreak: 'break-all' }}>{initial.image}</span>
              </div>
            )}
          </label>
          {/* Previsualización de imagen */}
          {(image || initial?.image) && (
            <div style={{ marginBottom: 8 }}>
              <img
                src={image
                  ? URL.createObjectURL(image)
                  : initial?.image?.startsWith('http') || initial?.image?.startsWith('data:')
                    ? initial.image
                    : `http://localhost:4000/${initial?.image?.replace(/^\/+/, '')}`}
                alt="Previsualización"
                style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, border: '1px solid #ccc' }}
              />
            </div>
          )}
          <label style={{ marginBottom: 8, display: 'block' }}>
            Archivo (link):
            <input
              type="url"
              placeholder="https://..."
              value={fileLink}
              onChange={(e) => setFileLink(e.target.value)}
              style={{ display: 'block', marginTop: 4 }}
            />
          </label>
          <div className="actions">
            <button type="submit" className="confirm" disabled={isDuplicateName}>{initial?.id ? 'Actualizar' : 'Crear'}</button>
            <button type="button" className="cancel" onClick={onClose}>Cancelar</button>
          </div>
          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default CampaignModal;
