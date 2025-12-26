import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { RegionItem } from '../interfaces/region';

interface Props {
  open: boolean;
  initial?: Partial<RegionItem>;
  onSubmit: (data: Partial<RegionItem>) => void | Promise<void>;
  onClose: () => void;
}

const RegionModal: React.FC<Props> = ({ open, initial, onSubmit, onClose }) => {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [link, setLink] = useState(initial?.link || '');

  useEffect(() => {
    if (!open) return;
    setName(initial?.name || '');
    setDescription(initial?.description || '');
    setLink(initial?.link || '');
  }, [open, initial?.id, initial?.name, initial?.description, initial?.link]);

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 520, minWidth: 340 }}>
        <button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
          <FaTimes size={18} />
        </button>
        <h2 className="modal-title" style={{ marginTop: 0 }}>{initial?.id ? 'Editar Región' : 'Nueva Región'}</h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await Promise.resolve(
              onSubmit({
                name: name.trim(),
                description,
                link: link.trim(),
              }),
            );
          }}
          autoComplete="off"
        >
          <input
            name="name"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="off"
          />
          <textarea
            name="description"
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            autoComplete="off"
          />
          <label style={{ marginBottom: 8, display: 'block' }}>
            Link:
            <input
              type="url"
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              style={{ display: 'block', marginTop: 4 }}
            />
          </label>

          <div className="actions">
            <button type="submit" className="confirm">{initial?.id ? 'Actualizar' : 'Crear'}</button>
            <button type="button" className="cancel" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegionModal;
