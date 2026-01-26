import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { TalentItem } from '../interfaces/talent';
import CpImageFill from './CpImageFill';

interface Props {
  open: boolean;
  initial?: any;
  talents?: TalentItem[];
  onClose: () => void;
  onSubmit: (data: any) => void | Promise<void>;
}

const TalentTreeModal: React.FC<Props> = ({ open, initial, talents, onClose, onSubmit }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [file, setFile] = useState(initial?.file ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setFile(initial?.file ?? initial?.image ?? '');
    setError(null);
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ width: 640, maxWidth: '94vw' }}>
        <button className="icon option" title="Cerrar" onClick={onClose} aria-label="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
          <FaTimes size={18} />
        </button>
        <h2 style={{ marginTop: 0 }}>{initial?.id ? 'Editar Árbol de Talentos' : 'Nuevo Árbol de Talentos'}</h2>

        <form onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          const trimmed = name.trim();
          if (!trimmed) return setError('El nombre es requerido.');
          try {
            setSaving(true);
            if (imageFile) {
              const fd = new FormData();
              fd.append('name', trimmed);
              fd.append('file', imageFile);
              if (file?.trim()) fd.append('fileLink', file.trim());
              await onSubmit(fd);
            } else {
              const payload: any = { name: trimmed, file: file?.trim() || undefined };
              if (removeImage) payload.file = '';
              await onSubmit(payload);
            }
          } catch (err: any) {
            setError(err?.message || 'Error guardando');
          } finally {
            setSaving(false);
          }
        }}>
          <label>
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={140} />
          </label>

          <label>
            Archivo (link)
            <input value={file} onChange={(e) => setFile(e.target.value)} />
          </label>

          <label style={{ display: 'block', marginTop: 8 }}>
            Imagen de fondo
            <input type="file" accept="image/*" onChange={(e) => { setImageFile(e.target.files?.[0] || null); setRemoveImage(false); }} style={{ display: 'block', marginTop: 4 }} />
            {/** show preview: either selected file or existing file/image */}
            {(imageFile || (initial && (initial.file || initial.image)) ) && !removeImage && (
              <div style={{ marginTop: 8, width: '100%', height: 120, borderRadius: 6, overflow: 'hidden' }}>
                <CpImageFill rawSrc={imageFile ? undefined : (initial?.file || initial?.image)} src={imageFile ? URL.createObjectURL(imageFile) : undefined} alt="Previsualización" fit="cover" />
              </div>
            )}
            {initial && !imageFile && (initial.file || initial.image) && !removeImage && (
              <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>
                Ruta actual: <span style={{ wordBreak: 'break-all' }}>{initial.file ?? initial.image}</span>
                <button type="button" className="icon option" style={{ marginLeft: 8 }} onClick={() => setRemoveImage(true)}>Quitar</button>
              </div>
            )}
            {imageFile && (
              <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>Se usará la imagen seleccionada al guardar.</div>
            )}
            {removeImage && (
              <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>La imagen actual será eliminada al guardar.</div>
            )}
          </label>

          <div style={{ marginTop: 8, color: '#777', fontSize: 13 }}>
            Añadir entradas y posicionamiento se hará en el editor del árbol (próximo paso).
          </div>

          {error ? <div style={{ color: '#e24444', fontSize: 13 }}>{error}</div> : null}

          <div className="actions">
            <button type="submit" className="confirm" disabled={saving}>{saving ? 'Confirmando...' : 'Confirmar'}</button>
            <button type="button" className="cancel" onClick={onClose} disabled={saving}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TalentTreeModal;
