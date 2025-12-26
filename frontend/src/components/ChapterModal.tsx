import React, { useEffect, useMemo, useState } from 'react';
import { Chapter } from '../interfaces/chapter';
import { FaTimes } from 'react-icons/fa';
import { getAllChapters } from '../js/chapterApi';
import { getCampaign } from '../js/campaignApi';

const getImageUrl = (img?: string) => {
  if (!img) return undefined;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return encodeURI(`http://localhost:4000/${img.replace(/^\/+/, '')}`);
};

interface Props {
  open: boolean;
  campaignId: number;
  initial?: Partial<Chapter>;
  onSubmit: (data: FormData) => void | Promise<void>;
  onClose: () => void;
}

const ChapterModal: React.FC<Props> = ({ open, campaignId, initial, onSubmit, onClose }) => {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [image, setImage] = useState<File | null>(null);
  const [fileLink, setFileLink] = useState(initial?.file || '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [dupMessage, setDupMessage] = useState<string | null>(null);
  const [campaignNameCache, setCampaignNameCache] = useState<Record<number, string>>({});

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
        const list = await getAllChapters();
        if (cancelled) return;
        setAllChapters(list ?? []);
      } catch {
        if (cancelled) return;
        setAllChapters([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const normalizedName = useMemo(() => name.trim().toLowerCase(), [name]);

  const duplicate = useMemo(() => {
    if (!normalizedName) return null;
    return (
      allChapters.find(
        (ch) => (ch.name ?? '').trim().toLowerCase() === normalizedName && ch.id !== initial?.id,
      ) ?? null
    );
  }, [allChapters, normalizedName, initial?.id]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      if (!duplicate) {
        setDupMessage(null);
        return;
      }

      const cached = campaignNameCache[duplicate.campaignId];
      if (cached) {
        setDupMessage(`La campaña ${cached} tiene un capítulo con ese nombre`);
        return;
      }

      try {
        const campaign = await getCampaign(duplicate.campaignId);
        if (cancelled) return;
        setCampaignNameCache((prev) => ({ ...prev, [duplicate.campaignId]: campaign.name }));
        setDupMessage(`La campaña ${campaign.name} tiene un capítulo con ese nombre`);
      } catch {
        if (cancelled) return;
        setDupMessage(`La campaña ${duplicate.campaignId} tiene un capítulo con ese nombre`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, duplicate, campaignNameCache]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (duplicate) {
      setError(dupMessage ?? 'Ya existe un capítulo con ese nombre');
      return;
    }
    setError(null);
    const formData = new FormData();
    formData.append('campaignId', String(campaignId));
    formData.append('name', name);
    formData.append('description', description);
    if (image) formData.append('image', image);
    formData.append('file', fileLink.trim());
    try {
      setSubmitting(true);
      await Promise.resolve(onSubmit(formData));
    } catch (err: any) {
      setError(String(err?.message ?? err ?? 'Error guardando capítulo'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 520, minWidth: 340 }}>
        <button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
          <FaTimes size={18} />
        </button>
        <h2 className="modal-title" style={{ marginTop: 0 }}>
          {initial?.id ? 'Editar Capítulo' : 'Nuevo Capítulo'}
        </h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            name="name"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="off"
            style={duplicate ? { borderColor: 'red' } : {}}
          />
          {duplicate ? (
            <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>{dupMessage ?? 'Ya existe un capítulo con ese nombre'}</div>
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
              <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>
                Ruta actual: <span style={{ wordBreak: 'break-all' }}>{initial.image}</span>
              </div>
            ) : null}
          </label>

          {(image || initial?.image) ? (
            <div style={{ marginBottom: 8 }}>
              <img
                src={image ? URL.createObjectURL(image) : getImageUrl(initial?.image)}
                alt="Previsualización"
                style={{ maxWidth: '100%', maxHeight: 140, borderRadius: 8, border: '1px solid #ccc' }}
              />
            </div>
          ) : null}
          <label style={{ marginBottom: 8, display: 'block' }}>
            Archivo (link):
            <input
              type="url"
              placeholder="https://..."
              value={fileLink}
              onChange={(e) => setFileLink(e.target.value)}
              style={{ display: 'block', marginTop: 4 }}
            />
            {initial?.file ? (
              <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>
                Link actual: <span style={{ wordBreak: 'break-all' }}>{initial.file}</span>
              </div>
            ) : null}
          </label>
          <div className="actions">
            <button type="submit" className="confirm" disabled={submitting || Boolean(duplicate)}>{initial?.id ? 'Actualizar' : 'Crear'}</button>
            <button type="button" className="cancel" onClick={onClose} disabled={submitting}>Cancelar</button>
          </div>
          {error ? <div style={{ color: 'red', marginTop: 8 }}>{error}</div> : null}
        </form>
      </div>
    </div>
  );
};

export default ChapterModal;
