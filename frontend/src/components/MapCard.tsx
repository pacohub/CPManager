import React, { useEffect, useState } from 'react';
import { FaDownload, FaEdit, FaGlobe, FaTrash, FaUpload, FaExclamationTriangle } from 'react-icons/fa';
import { MapItem } from '../interfaces/map';
import { updateMap } from '../js/mapApi';
import MapRegionsModal from './MapRegionsModal';

interface Props {
  map: MapItem;
  onEdit: () => void;
  onDelete: () => void;
  onChanged?: () => void;
}

const getImageUrl = (img?: string) => {
  if (!img) return undefined;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return encodeURI(`http://localhost:4000/${img.replace(/^\/+/, '')}`);
};

const MapCard: React.FC<Props> = ({ map, onEdit, onDelete, onChanged }) => {
  const bg = map.image ? `url("${getImageUrl(map.image)}")` : undefined;

  const regions = (map.regions ?? []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
  const regionNames = regions.map((r) => r.name).filter(Boolean);
  const visibleRegions = regions.slice(0, 3);
  const remainingCount = Math.max(0, regions.length - visibleRegions.length);
  const regionsTitle = regionNames.length ? `Regiones: ${regionNames.join(', ')}` : undefined;

  const [regionsModalOpen, setRegionsModalOpen] = useState(false);

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

  const regionIssues = regions
    .map((r) => {
      const missingFields: string[] = [];
      if (!String(r.description ?? '').trim()) missingFields.push('descripción');
      if (!String(r.link ?? '').trim()) missingFields.push('link');
      return missingFields.length ? { name: r.name, missingFields } : null;
    })
    .filter(Boolean) as Array<{ name: string; missingFields: string[] }>;

  const missing: string[] = [];
  if (!hasDescription) missing.push('descripción');
  if (!hasImage) missing.push('imagen');
  if (!hasFile) missing.push('archivo');

  const showWarning = missing.length > 0 || regionIssues.length > 0;
  const parts: string[] = [];
  if (missing.length > 0) parts.push(`Falta: ${missing.join(', ')}.`);
  if (regionIssues.length > 0) {
    const details = regionIssues.map((x) => `${x.name} (${x.missingFields.join(', ')})`).join('; ');
    parts.push(`Regiones incompletas: ${details}.`);
  }
  const warningText = parts.join(' ');

  return (
    <div
      className="campaign-card metallic-border map-card"
      style={{ backgroundImage: bg, width: '100%', height: 'auto', aspectRatio: '4 / 3' }}
      tabIndex={0}
      aria-label={map.name}
    >
      {showWarning ? (
        <span
          className="campaign-warning"
          title={warningText}
          aria-label={warningText}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <FaExclamationTriangle size={14} />
        </span>
      ) : null}
      <div className="campaign-title">
        <div>{map.name}</div>
      </div>

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
          title="Asociar regiones"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            setRegionsModalOpen(true);
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <FaGlobe size={14} />
        </button>

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

      <div className="campaign-desc">
        <div>{map.description}</div>
        {regions.length ? (
          <div className="map-region-tags" title={regionsTitle} aria-label={regionsTitle}>
            {visibleRegions.map((r) => (
              <span key={r.id} className="map-region-tag" title={r.name}>
                {r.name}
              </span>
            ))}
            {remainingCount ? (
              <span className="map-region-tag map-region-tag-more" title={regionsTitle}>
                +{remainingCount}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {regionsModalOpen ? (
        <MapRegionsModal
          open={regionsModalOpen}
          map={map}
          onClose={() => setRegionsModalOpen(false)}
          onSaved={() => onChanged?.()}
        />
      ) : null}
    </div>
  );
};

export default MapCard;
