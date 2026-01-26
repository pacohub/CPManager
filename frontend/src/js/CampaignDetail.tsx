import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaBookmark, FaLock, FaLockOpen, FaExclamation, FaCompass, FaMountain, FaFlag } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa';
import { FaEdit, FaTrash, FaDownload, FaUpload, FaExternalLinkAlt } from 'react-icons/fa';
import { GiWarPick, GiChest } from 'react-icons/gi';
import { Campaign } from '../interfaces/campaign';
import { useNavigate } from 'react-router-dom';
import { Chapter } from '../interfaces/chapter';
import { deleteCampaign, getCampaign, updateCampaign } from './campaignApi';
import { createChapter, deleteChapter, getChaptersByCampaign, updateChapter } from './chapterApi';
import { getChapterFactionsByCampaign } from './chapterFactionApi';
import { getEventCountsByChapter, getEvents } from './eventApi';
import { getObjectives } from './objectiveApi';
import { getMaps } from './mapApi';
import { getFactions, getFactionProfessions } from './factionApi';
import { getChapterResources } from './chapterResourceApi';
import { MapItem } from '../interfaces/map';
import { ResourceItem } from '../interfaces/resource';
import { GameObjectItem } from '../interfaces/gameObject';
import { FactionItem } from '../interfaces/faction';
import { ProfessionItem } from '../interfaces/profession';
import ChapterModal from '../components/ChapterModal';
import CampaignModal from '../components/CampaignModal';
import ConfirmModal from '../components/ConfirmModal';
import MapCard from '../components/MapCard';
import FactionCard from '../components/FactionCard';
import CpImage from '../components/CpImage';

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
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [eventCountsByChapterId, setEventCountsByChapterId] = useState<Record<number, { count: number; warningCount: number; missionCount: number; cinematicCount: number }>>({});
  const [eventCountsLoaded, setEventCountsLoaded] = useState(false);
  const [chapterFactionsByChapterId, setChapterFactionsByChapterId] = useState<Record<number, any[]>>({});
  const [objectivesByChapterId, setObjectivesByChapterId] = useState<Record<number, number>>({});
  const [cinematicHasDialogueByChapterId, setCinematicHasDialogueByChapterId] = useState<Record<number, boolean>>({});
  const [chaptersDndEnabled, setChaptersDndEnabled] = useState(false);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [chapterInitial, setChapterInitial] = useState<Partial<Chapter> | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Chapter | null>(null);

  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [confirmCampaignOpen, setConfirmCampaignOpen] = useState(false);

  const [aggregatedMaps, setAggregatedMaps] = useState<MapItem[]>([]);
  const [aggregatedProfessions, setAggregatedProfessions] = useState<ProfessionItem[]>([]);
  const [aggregatedResources, setAggregatedResources] = useState<ResourceItem[]>([]);
  const [aggregatedObjects, setAggregatedObjects] = useState<GameObjectItem[]>([]);
  const [aggregatedFactions, setAggregatedFactions] = useState<FactionItem[]>([]);
  const [aggregatedLoading, setAggregatedLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'maps' | 'professions' | 'resources' | 'objects' | 'factions'>('maps');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  useEffect(() => {
    (async () => {
      const c = await getCampaign(campaignId);
      setCampaign(c);
    })().catch((e) => console.error('Error cargando campaña', e));
  }, [campaignId]);

  useEffect(() => {
    // fetch objectives and cinematic dialogue presence for chapters
    (async () => {
      try {
        const objMap: Record<number, number> = {};
        const cineMap: Record<number, boolean> = {};
        for (const ch of chapters || []) {
          try {
            const objs = await getObjectives({ chapterId: ch.id }).catch(() => []);
            objMap[ch.id] = Array.isArray(objs) ? objs.length : 0;
          } catch (err) {
            objMap[ch.id] = 0;
          }

          try {
            const events = await getEvents({ chapterId: ch.id }).catch(() => []);
            const cinematics = (events || []).filter((ev: any) => String(ev.type ?? '').toUpperCase() === 'CINEMATIC');
            let hasDialogue = false;
            for (const ev of cinematics) {
              const dlg = (ev as any)?.dialogue;
              if (dlg && Array.isArray(dlg.lines) && dlg.lines.length > 0) { hasDialogue = true; break; }
            }
            cineMap[ch.id] = hasDialogue;
          } catch (err) {
            cineMap[ch.id] = false;
          }
        }
        setObjectivesByChapterId(objMap);
        setCinematicHasDialogueByChapterId(cineMap);
      } catch (err) {
        console.error('Error cargando objetivos/cinemáticas', err);
      }
    })();
  }, [chapters]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!chapters || chapters.length === 0) {
        setAggregatedMaps([]);
        setAggregatedProfessions([]);
        setAggregatedResources([]);
        setAggregatedObjects([]);
        setAggregatedFactions([]);
        return;
      }
      setAggregatedLoading(true);
      try {
        const chapterIds = (chapters || []).map((c) => c.id);

        const eventPromises = chapterIds.map((cid) => getEvents({ chapterId: cid }).catch(() => []));
        const eventsByChapter = await Promise.all(eventPromises);
        const mapIdSet = new Set<number>();
        for (const evs of eventsByChapter) {
          for (const ev of evs || []) {
            const rawMapId = (ev as any).mapId ?? (ev as any).map?.id ?? (ev as any).map?.Id;
            const mid = Number(rawMapId);
            if (Number.isFinite(mid)) mapIdSet.add(mid);
          }
        }
        const allMaps = await getMaps().catch(() => []);
        const maps = (allMaps || []).filter((m: any) => mapIdSet.has(Number(m.id)));

        const objPromises = chapterIds.map((cid) => getObjectives({ chapterId: cid }).catch(() => []));
        const objsByChapter = await Promise.all(objPromises);
        const objectById = new Map<number, GameObjectItem>();
        for (const list of objsByChapter) {
          for (const o of list || []) {
            if (Array.isArray((o as any).objects)) {
              for (const obj of (o as any).objects) {
                const id = Number(obj?.id);
                if (Number.isFinite(id) && !objectById.has(id)) objectById.set(id, obj as GameObjectItem);
              }
            }
          }
        }

        const resPromises = chapterIds.map((cid) => getChapterResources(cid).catch(() => []));
        const resourcesLists = await Promise.all(resPromises);
        const resourceById = new Map<number, ResourceItem>();
        for (const rl of resourcesLists) {
          for (const r of rl || []) {
            const id = Number((r as any).id);
            if (Number.isFinite(id) && !resourceById.has(id)) resourceById.set(id, r as ResourceItem);
          }
        }

        const factionIdSet = new Set<number>();
        for (const ch of chapters) {
          const links = chapterFactionsByChapterId[ch.id] || [];
          for (const l of links) {
            const fid = Number((l as any).factionId);
            if (Number.isFinite(fid)) factionIdSet.add(fid);
          }
        }
        const allFactions = await getFactions().catch(() => []);
        const factions = (allFactions || []).filter((f: any) => factionIdSet.has(Number(f.id)));

        const profById = new Map<number, ProfessionItem>();
        const factionIds = Array.from(factionIdSet);
        for (const fid of factionIds) {
          try {
            const profs = await getFactionProfessions(fid).catch(() => []);
            for (const p of profs || []) {
              const id = Number((p as any).id);
              if (Number.isFinite(id) && !profById.has(id)) profById.set(id, p as ProfessionItem);
            }
          } catch (err) {
            // ignore per-faction errors
          }
        }

        if (cancelled) return;
        setAggregatedMaps(maps || []);
        setAggregatedObjects(Array.from(objectById.values()));
        setAggregatedResources(Array.from(resourceById.values()));
        setAggregatedFactions(factions || []);
        setAggregatedProfessions(Array.from(profById.values()));
      } catch (err) {
        console.error('Error cargando agregados por capítulos', err);
        setAggregatedMaps([]);
        setAggregatedObjects([]);
        setAggregatedResources([]);
        setAggregatedFactions([]);
        setAggregatedProfessions([]);
      } finally {
        if (!cancelled) setAggregatedLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [chapters, chapterFactionsByChapterId]);

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
    (async () => {
      try {
        const map = await getChapterFactionsByCampaign(campaignId).catch(() => ({} as Record<number, any[]>));
        setChapterFactionsByChapterId(map || {});
      } catch (err) {
        console.error('Error cargando chapter-factions', err);
        setChapterFactionsByChapterId({});
      }
    })();
  }, [campaignId]);

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
        <div className="panel-header" style={{ position: 'relative' }}>
          <button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
            <FaArrowLeft size={22} color="#FFD700" />
          </button>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              maxWidth: 'calc(100% - 160px)',
              padding: '6px 6% 8px 6%',
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.1 }}>Campaña</div>
            <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1, minWidth: 0, wordBreak: 'break-word' }}>Cargando...</div>
          </div>
          <div style={{ width: 34 }} />
        </div>
        <div style={{ padding: 12 }}>Cargando...</div>
      </div>
    );
  }

  return (
    <div className="panel panel-corners-soft block-border block-panel-border">
      <div className="panel-header" style={{ position: 'relative' }}>
        <button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
          <FaArrowLeft size={22} color="#FFD700" />
        </button>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            maxWidth: 'calc(100% - 200px)',
            padding: '6px 6% 8px 6%',
            minWidth: 0,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.1 }}>Campaña</div>
          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1, minWidth: 0, wordBreak: 'break-word' }}>{campaign.name}</div>
        </div>
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
                              // Check chapter-faction associations
                              const factionLinks = chapterFactionsByChapterId[ch.id] || [];
                              if (factionLinks.length === 0) missing.push('facciones');
                              if (missing.length === 0 && warnings.length === 0) return null;
                              const parts: string[] = [];
                              // ...eliminado warning visual...
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

        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#e2d9b7' }}>Asociados en capítulos</div>
              <div style={{ display: 'flex', gap: 8 }}>
              {(['maps','professions','resources','objects','factions'] as const).map((t) => (
                <button
                  key={t}
                  aria-label={
                    t === 'maps' ? `Mapas (${aggregatedMaps.length})`
                    : t === 'professions' ? `Profesiones (${aggregatedProfessions.length})`
                    : t === 'resources' ? `Recursos (${aggregatedResources.length})`
                    : t === 'objects' ? `Objetos (${aggregatedObjects.length})`
                    : `Facciones (${aggregatedFactions.length})`
                  }
                  data-tooltip={t === 'maps' ? 'Mapas' : t === 'professions' ? 'Profesiones' : t === 'resources' ? 'Recursos' : t === 'objects' ? 'Objetos' : 'Facciones'}
                  title={
                    t === 'maps' ? `Mapas (${aggregatedMaps.length})`
                    : t === 'professions' ? `Profesiones (${aggregatedProfessions.length})`
                    : t === 'resources' ? `Recursos (${aggregatedResources.length})`
                    : t === 'objects' ? `Objetos (${aggregatedObjects.length})`
                    : `Facciones (${aggregatedFactions.length})`
                  }
                  onClick={() => setActiveTab(t)}
                  style={{
                    padding: '6px 10px',
                    background: activeTab === t ? 'rgba(255,217,64,0.08)' : 'transparent',
                    border: '1px solid transparent',
                    borderBottom: activeTab === t ? '2px solid #FFD700' : undefined,
                    color: '#e2d9b7',
                    cursor: 'pointer',
                    fontWeight: activeTab === t ? 800 : 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  {t === 'maps' ? (
                    <>
                      <FaCompass size={18} color="#FFD700" />
                      <span style={{ marginLeft: 6, background: '#FFD700', color: '#000', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 800 }}>{aggregatedMaps.length}</span>
                    </>
                  ) : t === 'professions' ? (
                    <>
                      <GiWarPick size={18} color="#FFD700" />
                      <span style={{ marginLeft: 6, background: '#FFD700', color: '#000', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 800 }}>{aggregatedProfessions.length}</span>
                    </>
                  ) : t === 'resources' ? (
                    <>
                      <FaMountain size={18} color="#FFD700" />
                      <span style={{ marginLeft: 6, background: '#FFD700', color: '#000', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 800 }}>{aggregatedResources.length}</span>
                    </>
                  ) : t === 'objects' ? (
                    <>
                      <GiChest size={18} color="#FFD700" />
                      <span style={{ marginLeft: 6, background: '#FFD700', color: '#000', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 800 }}>{aggregatedObjects.length}</span>
                    </>
                  ) : (
                    <>
                      <FaFlag size={18} color="#FFD700" />
                      <span style={{ marginLeft: 6, background: '#FFD700', color: '#000', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 800 }}>{aggregatedFactions.length}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

              <div style={{ marginTop: 10 }}>
            {aggregatedLoading ? (
              <div style={{ opacity: 0.6 }}>Cargando...</div>
            ) : (
              <div>
                {activeTab === 'maps' ? (
                  aggregatedMaps.length === 0 ? <div style={{ opacity: 0.7 }}>—</div> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                      {aggregatedMaps.map((m) => (
                        <MapCard
                          key={m.id}
                          map={m}
                          componentCount={undefined}
                          onChanged={() => {}}
                          onOpen={() => navigate(`/maps/${m.id}`)}
                          onEdit={() => {}}
                          onDelete={() => {}}
                          hideActions={true}
                        />
                      ))}
                    </div>
                  )
                ) : activeTab === 'professions' ? (
                  aggregatedProfessions.length === 0 ? <div style={{ opacity: 0.7 }}>—</div> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                      {aggregatedProfessions.map((p) => (
                        <div
                          key={p.id}
                          className="block-border block-border-soft mechanic-card"
                          style={{ padding: 12, cursor: 'pointer' }}
                          onClick={() => navigate(`/professions/${p.id}`)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ fontWeight: 800, wordBreak: 'break-word' }}>{p.name}</div>
                              </div>
                              {p.description ? (
                                <div style={{ marginTop: 6, opacity: 0.9, fontSize: 13, whiteSpace: 'pre-wrap' }}>{p.description}</div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : activeTab === 'resources' ? (
                  aggregatedResources.length === 0 ? <div style={{ opacity: 0.7 }}>—</div> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                      {aggregatedResources.map((r) => {
                        const iconUrl = r.icon ? (r.icon.startsWith('http') || r.icon.startsWith('data:') ? r.icon : `http://localhost:4000/${r.icon.replace(/^\/+/, '')}`) : undefined;
                        const linkHref = r.fileLink ? (r.fileLink.startsWith('http') ? r.fileLink : `http://localhost:4000/${r.fileLink.replace(/^\/+/, '')}`) : undefined;
                        const missing: string[] = [];
                        if (!r.resourceType?.id) missing.push('tipo');
                        if (!r.description) missing.push('descripción');
                        if (!r.icon) missing.push('icono');
                        if (!r.fileLink) missing.push('archivo');
                        return (
                          <div key={r.id} className="block-border block-border-soft mechanic-card" style={{ padding: 12, cursor: 'pointer' }} onClick={() => navigate('/resources')}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                              <div style={{ minWidth: 0 }} title={(r.description || '').trim() || undefined}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <CpImage src={iconUrl} width={32} height={32} fit="cover" frameStyle={{ flex: '0 0 auto' }} />
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                      <div style={{ fontWeight: 800, wordBreak: 'break-word' }}>{r.name}</div>
                                      {/* ...eliminado warning visual... */}
                                    </div>
                                    {r.resourceType?.name ? <div style={{ marginTop: 2, fontSize: 12, opacity: 0.85 }}>{r.resourceType.name}</div> : null}
                                  </div>
                                </div>
                                {linkHref ? (
                                  <div style={{ marginTop: 6, opacity: 0.92, fontSize: 13 }}>
                                    Archivo:{' '}
                                    <a href={linkHref} target="_blank" rel="noopener noreferrer">{r.fileLink}</a>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : activeTab === 'objects' ? (
                  aggregatedObjects.length === 0 ? <div style={{ opacity: 0.7 }}>—</div> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                      {aggregatedObjects.map((o) => {
                        const iconUrl = o.icon ? (o.icon.startsWith('http') || o.icon.startsWith('data:') ? o.icon : `http://localhost:4000/${o.icon.replace(/^\/+/, '')}`) : undefined;
                        const missing: string[] = [];
                        if (!(o.icon || '').trim()) missing.push('icono');
                        if (!(o.description || '').trim()) missing.push('descripción');
                        if (!(o.fileLink || '').trim()) missing.push('link');
                        const showWarning = missing.length > 0;
                        return (
                          <div key={o.id} className="block-border block-border-soft mechanic-card" style={{ padding: 12, position: 'relative', cursor: 'pointer' }} onClick={() => navigate(`/objects/${o.id}`)}>
                            {/* ...eliminado warning visual... */}

                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                              <div style={{ minWidth: 0 }} title={(o.description || '').trim() || undefined}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <CpImage src={iconUrl} width={32} height={32} fit="cover" frameStyle={{ flex: '0 0 auto' }} />
                                  <div style={{ fontWeight: 800, wordBreak: 'break-word' }}>{o.name}</div>
                                </div>

                                {(o.fileLink || '').trim() ? (
                                  <div style={{ marginTop: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <FaExternalLinkAlt size={12} />
                                    <a href={(o.fileLink || '').trim()} target="_blank" rel="noreferrer" style={{ color: '#e2c044', textDecoration: 'underline', wordBreak: 'break-all' }}>{(o.fileLink || '').trim()}</a>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  aggregatedFactions.length === 0 ? <div style={{ opacity: 0.7 }}>—</div> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                      {aggregatedFactions.map((f) => (
                        <FactionCard
                          key={f.id}
                          faction={f}
                          professions={[]}
                          classes={[]}
                          onEdit={() => {}}
                          onDelete={() => {}}
                          onOpen={() => navigate(`/factions/${f.id}`)}
                          hideActions={true}
                        />
                      ))}
                    </div>
                  )
                )}
              </div>
            )}
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
      requireText="eliminar"
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
        requireText="eliminar"
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
