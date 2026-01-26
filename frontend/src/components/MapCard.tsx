import React, { useEffect, useState } from 'react';
import { FaExclamation } from 'react-icons/fa';
import { FaDownload, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';
import { MapItem } from '../interfaces/map';
import { updateMap } from '../js/mapApi';

interface Props {
  map: MapItem;
  onEdit: () => void;
  onDelete: () => void;
  onChanged?: () => void;
	onOpen?: () => void;
	componentCount?: number;
  hideActions?: boolean;
  campaignCount?: number;
}

const getImageUrl = (img?: string) => {
  if (!img) return undefined;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return encodeURI(`http://localhost:4000/${img.replace(/^\/+/, '')}`);
};

const MapCard: React.FC<Props> = ({ map, onEdit, onDelete, onChanged, onOpen, componentCount, hideActions, campaignCount }) => {
  const bg = map.image ? `url("${getImageUrl(map.image)}")` : undefined;

  const [imageExists, setImageExists] = useState(true);
  useEffect(() => {
    if (!map.image) return setImageExists(true);
    const url = getImageUrl(map.image);
    if (!url) return setImageExists(true);
    fetch(url, { method: 'HEAD' })
      .then((res) => setImageExists(res.ok))
      .catch(() => setImageExists(false));
  }, [map.image]);

  const fileUrl = map.file
    ? map.file.startsWith('http')
      ? map.file
      : `http://localhost:4000/${map.file.replace(/^\/+/, '')}`
    : undefined;

  const hasDescription = Boolean((map.description ?? '').trim());
  const hasImage = Boolean(map.image) && imageExists;
  const hasFile = Boolean(map.file);
  const hasComponents = typeof componentCount === 'number' ? componentCount > 0 : true;
  const missing: string[] = [];
  if (!hasDescription) missing.push('descripción');
  if (!hasImage) missing.push('imagen');
  if (!hasFile) missing.push('archivo');
  if (!hasComponents) missing.push('componentes');
  const showWarning = missing.length > 0;
  const warningText = `Falta: ${missing.join(', ')}.`;

  return (
    <div
      className="campaign-card metallic-border map-card"
      style={{ backgroundImage: bg, width: '100%', height: 'auto', aspectRatio: '4 / 3' }}
      tabIndex={0}
      aria-label={map.name}
		onClick={() => onOpen?.()}
    >
      {/* ...eliminado warning visual... */}
      <div className="campaign-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: '1 1 auto' }}>{map.name}</div>
        {typeof campaignCount === 'number' && campaignCount > 0 ? (
          <div style={{ background: '#000', color: '#FFD700', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 800 }} title={`${campaignCount} campañas`}>
            {campaignCount}
          </div>
        ) : null}
      </div>

      {!hideActions ? (
        <div className="campaign-actions">
        {fileUrl ? (
          <a
            className="icon option"
            title="Descargar archivo"
            tabIndex={-1}
            href={fileUrl}
            download
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <FaDownload size={14} />
          </a>
        ) : (
          <button
            className="icon option"
            title="Poner link"
            tabIndex={-1}
            onClick={async (e) => {
              e.stopPropagation();
              const nextLink = window.prompt('Pega el link del archivo del mapa (URL):', map.file ?? '');
              if (nextLink === null) return;
              const trimmed = nextLink.trim();
              try {
                const formData = new FormData();
                formData.append('name', map.name);
                formData.append('description', map.description ?? '');
                formData.append('file', trimmed);
                await updateMap(map.id, formData);
                onChanged?.();
              } catch (err) {
                console.error('Error guardando link del mapa', err);
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <FaUpload size={14} />
          </button>
        )}
        <button
          className="icon option"
          title="Editar"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <FaEdit size={14} />
        </button>
        <button
          className="icon option"
          title="Eliminar"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <FaTrash size={14} />
        </button>
        </div>
      ) : null}

      <div className="campaign-desc">{map.description}</div>
    </div>
  );
};

export default MapCard;
