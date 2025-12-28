import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaArrowLeft, FaEdit, FaTrash, FaBookmark, FaDownload, FaUpload, FaLock, FaLockOpen, FaExclamationTriangle } from 'react-icons/fa';
import { Campaign } from '../interfaces/campaign';
import { Chapter } from '../interfaces/chapter';
import { deleteCampaign, getCampaign, updateCampaign } from './campaignApi';
import { createChapter, deleteChapter, getChaptersByCampaign, updateChapter } from './chapterApi';
import { getEventCountsByChapter } from './eventApi';
import ChapterModal from '../components/ChapterModal';
import CampaignModal from '../components/CampaignModal';
import ConfirmModal from '../components/ConfirmModal';

interface Props {
  campaignId: number;
  onBack: () => void;
  onOpenChapterEvents?: (chapterId: number) => void;
}

function buildChapterOrderFormData(order: number): FormData {
  const formData = new FormData();
  formData.append('order', String(order));
  return formData;
}

interface SortableChapterRowProps {
  chapter: Chapter;
  enabled: boolean;
  children: React.ReactNode;
}

const SortableChapterRow: React.FC<SortableChapterRowProps> = ({ chapter, enabled, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `chapter:${chapter.id}`, disabled: !enabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    boxShadow: isDragging ? '0 0 10px #FFD700' : undefined,
    opacity: isDragging ? 0.85 : 1,
    cursor: enabled ? 'grab' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(enabled ? { ...attributes, ...listeners } : {})}
    >
      {children}
    </div>
  );
};

const getImageUrl = (img?: string) => {
  if (!img) return undefined;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return encodeURI(`http://localhost:4000/${img.replace(/^\/+/, '')}`);
};

const getFileUrl = (file?: string) => {
  if (!file) return undefined;
  if (file.startsWith('http')) return file;
  return encodeURI(`http://localhost:4000/${file.replace(/^\/+/, '')}`);
};

function buildChapterUpdateFormData(chapter: Chapter, patch: Partial<Chapter> = {}, file?: File): FormData {
  const formData = new FormData();
  formData.append('campaignId', String(patch.campaignId ?? chapter.campaignId));
  formData.append('name', String(patch.name ?? chapter.name ?? ''));
  formData.append('description', String(patch.description ?? chapter.description ?? ''));
  if (patch.file !== undefined) {
    formData.append('file', String(patch.file ?? ''));
  }
  return formData;
}

const CampaignDetail: React.FC<Props> = ({ campaignId, onBack, onOpenChapterEvents }) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [eventCountsByChapterId, setEventCountsByChapterId] = useState<Record<number, { count: number; warningCount: number; missionCount: number; cinematicCount: number }>>({});
  const [eventCountsLoaded, setEventCountsLoaded] = useState(false);
  const [chaptersDndEnabled, setChaptersDndEnabled] = useState(false);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [chapterInitial, setChapterInitial] = useState<Partial<Chapter> | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Chapter | null>(null);

  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [confirmCampaignOpen, setConfirmCampaignOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  useEffect(() => {
    (async () => {
      const c = await getCampaign(campaignId);
      setCampaign(c);
    })().catch((e) => console.error('Error cargando campaña', e));
  }, [campaignId]);

  const refreshChapters = useCallback(async () => {
    const list = await getChaptersByCampaign(campaignId);
    setChapters(list || []);
  }, [campaignId]);

  const refreshEventCounts = useCallback(async () => {
    setEventCountsLoaded(false);
    const counts = await getEventCountsByChapter(campaignId);
    setEventCountsByChapterId(counts || {});
    setEventCountsLoaded(true);
  }, [campaignId]);

  useEffect(() => {
    refreshChapters().catch((e) => console.error('Error cargando capítulos', e));
  }, [refreshChapters]);

  useEffect(() => {
    refreshEventCounts().catch((e) => {
      console.error('Error cargando conteo de eventos', e);
      setEventCountsLoaded(false);
    });
  }, [refreshEventCounts]);

  const normalizeNameForCompare = useCallback((value: any) => {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }, []);

  const isCreditsChapter = useCallback((ch: Chapter) => {
    if (String((ch as any)?.specialType ?? '') === 'CREDITS') return true;
    const name = normalizeNameForCompare(ch?.name);
    return name === 'creditos' || name === 'credits';
  }, [normalizeNameForCompare]);

  const isCinematicOnlyChapter = useCallback((ch: Chapter) => {
    if (!eventCountsLoaded) return false;
    const stats = eventCountsByChapterId[ch.id];
    const total = Number(stats?.count ?? 0);
    const mission = Number(stats?.missionCount ?? 0);
    const cinematic = Number(stats?.cinematicCount ?? 0);
    return total > 0 && mission === 0 && cinematic > 0;
  }, [eventCountsByChapterId, eventCountsLoaded]);

  const chapterLabelById = useMemo(() => {
    const out: Record<number, string> = {};
    const nonCredits = (chapters ?? []).filter((c) => !isCreditsChapter(c));
    const firstNonCreditsId = nonCredits[0]?.id;
    const lastNonCreditsId = nonCredits.length > 0 ? nonCredits[nonCredits.length - 1].id : undefined;

    let cap = 0;
    for (let idx = 0; idx < (chapters ?? []).length; idx++) {
      const ch = chapters[idx];
      if (isCreditsChapter(ch)) {
        out[ch.id] = 'Créditos';
        continue;
      }

      if (isCinematicOnlyChapter(ch)) {
        if (firstNonCreditsId !== undefined && ch.id === firstNonCreditsId) out[ch.id] = 'Prólogo';
        else if (lastNonCreditsId !== undefined && ch.id === lastNonCreditsId) out[ch.id] = 'Epílogo';
        else out[ch.id] = 'Interludio';
        continue;
      }

      // Fallback while counts load: use index-based numbering
      if (!eventCountsLoaded) {
        out[ch.id] = `Capítulo ${idx + 1}`;
      } else {
        cap += 1;
        out[ch.id] = `Capítulo ${cap}`;
      }
    }

    return out;
  }, [chapters, eventCountsLoaded, isCinematicOnlyChapter, isCreditsChapter]);

  const bg = useMemo(() => {
    const url = getImageUrl(campaign?.image);
    return url ? `url("${url}")` : undefined;
  }, [campaign?.image]);

  if (!campaign) {
    return (
      <div className="panel panel-corners-soft block-border block-panel-border">
        <div className="panel-header">
          <button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
            <FaArrowLeft size={22} color="#FFD700" />
          </button>
          <h1 style={{ margin: 0 }}>Campaña</h1>
          <div style={{ width: 34 }} />
        </div>
        <div style={{ padding: 12 }}>Cargando...</div>
      </div>
    );
  }

  return (
    <div className="panel panel-corners-soft block-border block-panel-border">
      <div className="panel-header">
        <button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
          <FaArrowLeft size={22} color="#FFD700" />
        </button>
        <h1 style={{ margin: 0, minWidth: 0, wordBreak: 'break-word' }}>{campaign.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="icon option"
            title="Editar"
            onClick={() => setCampaignModalOpen(true)}
          >
            <FaEdit size={18} />
          </button>
          <button
            className="icon option"
            title="Eliminar"
            onClick={() => setConfirmCampaignOpen(true)}
          >
            <FaTrash size={18} />
          </button>
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: 420,
          borderRadius: 10,
          overflow: 'hidden',
          backgroundImage: bg,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.80) 100%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            width: '100%',
            padding: 14,
            boxSizing: 'border-box',
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Left division: campaign info */}
          <div
            style={{
              flex: '1 1 420px',
              minWidth: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 12,
              boxSizing: 'border-box',
            }}
          >
            <div style={{ width: '100%', maxWidth: 640 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#e2c044', textAlign: 'center' }}>{campaign.name}</div>
              <div style={{ marginTop: 8, color: '#e2d9b7', opacity: 0.98, textAlign: 'center' }}>
                {campaign.description}
              </div>
            </div>
          </div>

          {/* Right division: chapters */}
          <div
            style={{
              flex: '0 0 380px',
              maxWidth: '100%',
              minWidth: 280,
              padding: 12,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  className="icon"
                  aria-label="Nuevo Capítulo"
                  title="Nuevo Capítulo"
                  onClick={() => {
                    setChapterInitial(undefined);
                    setChapterModalOpen(true);
                  }}
                  style={{ background: 'none', border: 'none' }}
                >
                  <FaBookmark size={20} color="#FFD700" />
                </button>
                <button
                  className="icon"
                  aria-label={chaptersDndEnabled ? 'Deshabilitar reordenamiento' : 'Habilitar reordenamiento'}
                  title={chaptersDndEnabled ? 'Deshabilitar reordenamiento' : 'Habilitar reordenamiento'}
                  onClick={() => setChaptersDndEnabled((v) => !v)}
                  style={{ background: 'none', border: 'none' }}
                >
                  {chaptersDndEnabled ? <FaLockOpen size={18} color="#FFD700" /> : <FaLock size={18} color="#FFD700" />}
                </button>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={async (event) => {
                if (!chaptersDndEnabled) return;
                const { active, over } = event;
                if (!over) return;
                if (active.id === over.id) return;

                const activeId = String(active.id);
                const overId = String(over.id);
                if (!activeId.startsWith('chapter:') || !overId.startsWith('chapter:')) return;

                const activeChapterId = Number(activeId.replace('chapter:', ''));
                const overChapterId = Number(overId.replace('chapter:', ''));

                const activeCh = chapters.find((c) => c.id === activeChapterId);
                const overCh = chapters.find((c) => c.id === overChapterId);
                if (!activeCh || !overCh) return;
                if (isCreditsChapter(activeCh) || isCreditsChapter(overCh)) return;

                const oldIndex = chapters.findIndex((c) => c.id === activeChapterId);
                const newIndex = chapters.findIndex((c) => c.id === overChapterId);
                if (oldIndex < 0 || newIndex < 0) return;

                const next = arrayMove(chapters, oldIndex, newIndex).map((c, idx) => ({ ...c, order: idx }));
                setChapters(next);

                try {
                  for (let idx = 0; idx < next.length; idx++) {
                    const c = next[idx];
                    await updateChapter(c.id, buildChapterOrderFormData(idx));
                  }
                } catch (err) {
                  console.error('Error persistiendo orden de capítulos', err);
                  await refreshChapters();
                }
              }}
            >
              <SortableContext
                items={chapters.map((c) => `chapter:${c.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="chapters-scroll" style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {chapters.map((ch, idx) => (
                    <SortableChapterRow key={ch.id} chapter={ch} enabled={chaptersDndEnabled && !isCreditsChapter(ch)}>
                      <div
                        className="chapter-row"
                        style={{ padding: 0, position: 'relative', cursor: chaptersDndEnabled ? undefined : 'pointer' }}
                        data-tooltip={
                          chaptersDndEnabled
                            ? undefined
                            : String(ch.description ?? '').trim()
                              ? `${String(ch.description ?? '').trim()}\n\nClick: ver eventos del capítulo`
                              : 'Click: ver eventos del capítulo'
                        }
                        onClick={() => {
                          if (chaptersDndEnabled) return;
                          onOpenChapterEvents?.(ch.id);
                        }}
                      >
                        <button
                          type="button"
                          className="chapter-play"
                          title={ch.file ? 'Abrir link' : 'Poner link'}
                          aria-label={ch.file ? 'Abrir link' : 'Poner link'}
                          data-has-file={Boolean(ch.file)}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (ch.file) {
                              const url = getFileUrl(ch.file);
                              if (!url) return;
                              window.open(url, '_blank', 'noopener,noreferrer');
                              return;
                            }

                            const nextLink = window.prompt('Pega el link del archivo del capítulo (URL):', ch.file ?? '');
                            if (nextLink === null) return;
                            const trimmed = nextLink.trim();
                            try {
                              await updateChapter(ch.id, buildChapterUpdateFormData(ch, { file: trimmed }));
                              await refreshChapters();
                            } catch (err) {
                              console.error('Error guardando link de capítulo', err);
                            }
                          }}
                        >
                          {ch.file ? <FaDownload size={12} color="#FFD700" /> : <FaUpload size={12} color="#FFD700" />}
                        </button>

                        <div className="chapter-content" style={{ minWidth: 0 }}>
                          <div className="chapter-label">{chapterLabelById[ch.id] ?? `Capítulo ${idx + 1}`}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, marginTop: 2 }}>
                            <span style={{ minWidth: 0, wordBreak: 'break-word' }}>{ch.name}</span>
                            {(() => {
                              const missing: string[] = [];
                              const warnings: string[] = [];
                              if (!String(ch.description ?? '').trim()) missing.push('descripción');
                              if (eventCountsLoaded) {
                                const stats = eventCountsByChapterId[ch.id];
                                const count = stats?.count ?? 0;
                                const warningCount = stats?.warningCount ?? 0;
                                if (count <= 0) missing.push('eventos');
                                if (warningCount > 0) warnings.push(`Eventos sin descripción: ${warningCount}.`);
                              }
                              if (missing.length === 0 && warnings.length === 0) return null;
                              const parts: string[] = [];
                              if (missing.length > 0) {
                                const missingText = missing.length === 1
                                  ? `Falta: ${missing[0]}.`
                                  : `Falta: ${missing.join(', ')}.`;
                                parts.push(missingText);
                              }
                              if (warnings.length > 0) parts.push(warnings.join('\n'));
                              const warningText = parts.join('\n\n');
                              return (
                                <span
                                  className="saga-warning"
                                  title={warningText}
                                  aria-label={warningText}
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FaExclamationTriangle size={16} />
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        <div
                          className="chapter-actions"
                          style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="icon option"
                            title="Editar"
                            onClick={() => {
                              setChapterInitial(ch);
                              setChapterModalOpen(true);
                            }}
                          >
                            <FaEdit size={16} />
                          </button>
                          {!isCreditsChapter(ch) ? (
                            <button
                              className="icon option"
                              title="Eliminar"
                              onClick={() => {
                                setPendingDelete(ch);
                                setConfirmOpen(true);
                              }}
                            >
                              <FaTrash size={16} />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </SortableChapterRow>
                  ))}
                  {chapters.length === 0 ? (
                    <div style={{ opacity: 0.8, color: '#e2d9b7' }}>No hay capítulos todavía.</div>
                  ) : null}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>

      {chapterModalOpen ? (
        <ChapterModal
          open={chapterModalOpen}
          campaignId={campaignId}
          initial={chapterInitial}
          onClose={() => {
            setChapterModalOpen(false);
            setChapterInitial(undefined);
          }}
          onSubmit={async (formData) => {
            if (chapterInitial?.id) {
              await updateChapter(chapterInitial.id, formData);
            } else {
              await createChapter(formData);
            }
            await refreshChapters();
            setChapterModalOpen(false);
            setChapterInitial(undefined);
          }}
        />
      ) : null}

    {campaignModalOpen ? (
      <CampaignModal
        open={campaignModalOpen}
        initial={campaign}
        campaigns={[campaign]}
        onClose={() => setCampaignModalOpen(false)}
        onSubmit={async (formData) => {
          await updateCampaign(campaign.id, formData);
          const c = await getCampaign(campaignId);
          setCampaign(c);
          setCampaignModalOpen(false);
        }}
      />
    ) : null}

    <ConfirmModal
      open={confirmCampaignOpen}
      message={
        <span>
          ¿Estás seguro de que deseas eliminar la campaña <strong>{campaign.name}</strong>?
        </span>
      }
      onConfirm={async () => {
        setConfirmCampaignOpen(false);
        await deleteCampaign(campaign.id);
        onBack();
      }}
      onCancel={() => setConfirmCampaignOpen(false)}
    />

      <ConfirmModal
        open={confirmOpen}
        message={'¿Estás seguro de que deseas eliminar este capítulo?'}
        onConfirm={async () => {
          const target = pendingDelete;
          setConfirmOpen(false);
          setPendingDelete(null);
          if (!target) return;
          await deleteChapter(target.id);
          await refreshChapters();
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
      />

    </div>
  );
};

export default CampaignDetail;
