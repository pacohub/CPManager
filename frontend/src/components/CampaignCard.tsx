
import React, { useEffect, useState } from 'react';
import { createCampaign, updateCampaign } from '../js/campaignApi';
import { FaEdit, FaTrash, FaDownload, FaUpload, FaExclamationTriangle } from 'react-icons/fa';
import { Campaign } from '../interfaces/campaign';

interface Props {
  campaign: Campaign;
  onEdit: () => void;
  onDelete: () => void;
  onOpen?: () => void;
  chapterCount?: number;
}

const getImageUrl = (img?: string) => {
  if (!img) return undefined;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  // Asume ruta relativa desde backend y codifica la URL
  return encodeURI(`http://localhost:4000/${img.replace(/^\/+/, '')}`);
};

const CampaignCard: React.FC<Props> = ({ campaign, onEdit, onDelete, onOpen, chapterCount = 0 }) => {
  const [imageExists, setImageExists] = useState(true);
  useEffect(() => {
    if (!campaign.image) return setImageExists(true);
    const url = getImageUrl(campaign.image);
    if (!url) return setImageExists(true);
    fetch(url, { method: 'HEAD' })
      .then(res => setImageExists(res.ok))
      .catch(() => setImageExists(false));
  }, [campaign.image]);

  // Debug visual en consola y en UI
  const debugInfo = {
    campaignImage: campaign.image,
    imageExists,
    imageUrl: getImageUrl(campaign.image),
  };
  console.log('CampaignCard debug:', debugInfo);

  const hasDescription = Boolean((campaign.description ?? '').trim());
  const hasImage = Boolean(campaign.image);
  const hasFile = Boolean(campaign.file);
  const hasChapters = chapterCount > 0;
  const missing: string[] = [];
  if (!hasDescription) missing.push('descripción');
  if (!hasImage) missing.push('imagen');
  if (!hasFile) missing.push('archivo');
  if (!hasChapters) missing.push('capítulos');
  const showWarning = missing.length > 0;
  const warningText = `Falta: ${missing.join(', ')}.`;

  return (
    <div
      className="campaign-card metallic-border"
      style={{
        backgroundImage: campaign.image && imageExists ? `url("${getImageUrl(campaign.image)}")` : undefined
      }}
      tabIndex={0}
      aria-label={campaign.name}
      onClick={() => onOpen?.()}
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
      {/* Overlay hover handled by CSS */}
      {/* Nombre de la campaña */}
      <div className="campaign-title">
        <div>{campaign.name}</div>
        <div className="campaign-subtitle">{chapterCount} capítulos</div>
      </div>
      {/* Acciones solo en hover */}
      <div className="campaign-actions">
        {campaign.file ? (
          <a
            className="icon option"
            title="Descargar campaña"
            tabIndex={-1}
            href={campaign.file.startsWith('http') ? campaign.file : `http://localhost:4000/${campaign.file.replace(/^\/+/, '')}`}
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
              const nextLink = window.prompt('Pega el link del archivo de la campaña (URL):', campaign.file ?? '');
              if (nextLink === null) return;
              const trimmed = nextLink.trim();
              try {
                const formData = new FormData();
                formData.append('name', campaign.name);
                formData.append('description', campaign.description);
                formData.append('sagaId', String(campaign.sagaId));
                formData.append('file', trimmed);
                if (campaign.id) {
                  await updateCampaign(campaign.id, formData);
                } else {
                  await createCampaign(formData);
                }
                window.location.reload();
              } catch (err) {
                console.error('Error guardando link de campaña', err);
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <FaUpload size={14} />
          </button>
        )}
        <button className="icon option" title="Editar" onClick={e => { e.stopPropagation(); onEdit(); }} onPointerDown={e => e.stopPropagation()} tabIndex={-1}><FaEdit size={14} /></button>
        <button className="icon option" title="Eliminar" onClick={e => { e.stopPropagation(); onDelete(); }} onPointerDown={e => e.stopPropagation()} tabIndex={-1}><FaTrash size={14} /></button>
      </div>
      {/* Descripción solo en hover */}
      <div className="campaign-desc">
        {campaign.description}
      </div>
    </div>
  );
}

export default CampaignCard;
