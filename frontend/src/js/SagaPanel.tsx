import React, { useEffect, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Campaign } from '../interfaces/campaign';
import CampaignCard from '../components/CampaignCard';
import CampaignModal from '../components/CampaignModal';
import { getCampaignsBySaga, createCampaign, updateCampaign, deleteCampaign } from './campaignApi';
import { getAllChapters } from './chapterApi';
import { FaBookOpen, FaCubes, FaEdit, FaTrash, FaTimes, FaCampground, FaLockOpen, FaLock, FaChevronRight, FaChevronDown, FaExclamationTriangle, FaCompass, FaCogs, FaMountain, FaFlag, FaUser } from 'react-icons/fa';
import { GiChest, GiCrossedSwords, GiWarPick } from 'react-icons/gi';
import ConfirmModal from '../components/ConfirmModal';

interface SagaType {
  id: number;
  name: string;
  description: string;
}

const API_URL = 'http://localhost:4000/sagas';

function buildCampaignUpdateFormData(campaign: Campaign, patch: Partial<Campaign>): FormData {
  const formData = new FormData();
  formData.append('name', patch.name ?? campaign.name);
  formData.append('description', patch.description ?? campaign.description);
  formData.append('sagaId', String(patch.sagaId ?? campaign.sagaId));
  formData.append('order', String(patch.order ?? campaign.order ?? 0));
  return formData;
}

function parseCellId(id: string): { sagaId: number; order: number } | null {
  // cell:<sagaId>:<order>
  const parts = id.split(':');
  if (parts.length !== 3) return null;
  if (parts[0] !== 'cell') return null;
  const sagaId = Number(parts[1]);
  const order = Number(parts[2]);
  if (Number.isNaN(sagaId) || Number.isNaN(order)) return null;
  return { sagaId, order };
}

function isNumericId(id: string) {
  return /^\d+$/.test(id);
}

interface SortableSagaCardProps {
  saga: SagaType;
  dndEnabled: boolean;
  children: React.ReactNode;
}

const SortableSagaCard: React.FC<SortableSagaCardProps> = ({ saga, dndEnabled, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: saga.id.toString() });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    boxShadow: isDragging ? '0 0 10px #FFD700' : undefined,
    background: isDragging ? '#3b2c1a' : undefined,
    cursor: dndEnabled ? 'grab' : 'default',
    opacity: isDragging ? 0.8 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="saga-card block-card-border block-border-soft"
      {...(dndEnabled ? { ...attributes, ...listeners } : {})}
    >
      {children}
    </div>
  );
};

interface CampaignCellProps {
  id: string;
  children: React.ReactNode;
}

const CampaignCell: React.FC<CampaignCellProps> = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className="campaigns-responsive-cell"
      style={isOver ? { outline: '2px solid #e2c044' } : undefined}
    >
      {children}
    </div>
  );
};

interface DraggableCampaignProps {
  campaign: Campaign;
  enabled: boolean;
  children: React.ReactNode;
}

const DraggableCampaign: React.FC<DraggableCampaignProps> = ({ campaign, enabled, children }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `campaign:${campaign.id}`,
  });

  const style = {
    width: '100%',
    height: '100%',
    flex: 1,
    position: 'relative',
    zIndex: isDragging ? 10000 : 'auto',
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.6 : 1,
    cursor: enabled ? 'grab' : 'default',
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(enabled ? { ...listeners, ...attributes } : {})}
    >
      {children}
    </div>
  );
};

interface SagaPanelProps {
  onOpenCampaign?: (campaignId: number) => void;
  onOpenMaps?: () => void;
  onOpenMechanics?: () => void;
  onOpenFactions?: () => void;
	onOpenClasses?: () => void;
	onOpenCharacters?: () => void;
  onOpenProfessions?: () => void;
  onOpenObjects?: () => void;
	onOpenComponents?: () => void;
	onOpenResources?: () => void;
}

const SagaPanel: React.FC<SagaPanelProps> = ({ onOpenCampaign, onOpenMaps, onOpenMechanics, onOpenFactions, onOpenClasses, onOpenCharacters, onOpenProfessions, onOpenObjects, onOpenComponents, onOpenResources }) => {
  // Campañas por saga
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campaignInitial, setCampaignInitial] = useState<Partial<Campaign> | undefined>(undefined);
  const [campaignSagaId, setCampaignSagaId] = useState<number | null>(null);
  const [confirmCampaignOpen, setConfirmCampaignOpen] = useState(false);
  const [pendingDeleteCampaign, setPendingDeleteCampaign] = useState<Campaign | null>(null);
  const [sagas, setSagas] = useState<SagaType[]>([]);
  const [chaptersByCampaignId, setChaptersByCampaignId] = useState<Record<number, number>>({});
  const [form, setForm] = useState<Partial<SagaType>>({ name: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  // Drag and drop state for sagas
  const [dndEnabled, setDndEnabled] = useState(false);
  const suppressCampaignOpenUntilRef = React.useRef<number>(0);

  function shouldSuppressCampaignOpen() {
    return Date.now() < suppressCampaignOpenUntilRef.current;
  }
    // DnD Kit sensors
    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    // Drag and drop handlers (sagas + campaigns)
    const handleDragEnd = async (event: any) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);
      if (activeId === overId) return;

      // ---- Campaign drag/drop ----
      if (activeId.startsWith('campaign:')) {
        // Avoid click-triggered open right after dropping.
        suppressCampaignOpenUntilRef.current = Date.now() + 350;
        const campaignId = Number(activeId.split(':')[1]);
        if (Number.isNaN(campaignId)) return;

        const dragged = campaigns.find(c => c.id === campaignId);
        if (!dragged) return;

        let targetSagaId: number | null = null;
        let targetOrder: number | null = null;

        if (overId.startsWith('cell:')) {
          const parsed = parseCellId(overId);
          if (!parsed) return;
          targetSagaId = parsed.sagaId;
          targetOrder = parsed.order;
        } else if (overId.startsWith('campaign:')) {
          const targetCampaignId = Number(overId.split(':')[1]);
          if (Number.isNaN(targetCampaignId)) return;
          const targetCampaign = campaigns.find(c => c.id === targetCampaignId);
          if (!targetCampaign) return;
          targetSagaId = targetCampaign.sagaId;
          targetOrder = targetCampaign.order ?? 0;
        } else {
          // Not a valid campaign drop target
          return;
        }

        if (targetSagaId === null || targetOrder === null) return;

        const toSagaId = targetSagaId;
        const toOrder = targetOrder;

        const occupant = campaigns.find(c => c.sagaId === toSagaId && (c.order ?? 0) === toOrder);
        const fromSagaId = dragged.sagaId;
        const fromOrder = dragged.order ?? 0;

        // Optimistic local update
        setCampaigns(prev => {
          const next = prev.map(c => ({ ...c }));
          const draggedIdx = next.findIndex(c => c.id === dragged.id);
          if (draggedIdx === -1) return prev;

          const occupantIdx = occupant ? next.findIndex(c => c.id === occupant.id) : -1;
          if (occupant && occupantIdx !== -1) {
            // swap
            const tmpSagaId = next[draggedIdx].sagaId;
            const tmpOrder = next[draggedIdx].order ?? 0;
            next[draggedIdx].sagaId = next[occupantIdx].sagaId;
            next[draggedIdx].order = next[occupantIdx].order ?? 0;
            next[occupantIdx].sagaId = tmpSagaId;
            next[occupantIdx].order = tmpOrder;
          } else {
            next[draggedIdx].sagaId = toSagaId;
            next[draggedIdx].order = toOrder;
          }
          return next;
        });

        try {
          if (occupant && occupant.id !== dragged.id) {
            // Persist swap
            await updateCampaign(dragged.id, buildCampaignUpdateFormData(dragged, { sagaId: toSagaId, order: toOrder }));
            await updateCampaign(occupant.id, buildCampaignUpdateFormData(occupant, { sagaId: fromSagaId, order: fromOrder }));
          } else {
            // Persist move
            await updateCampaign(dragged.id, buildCampaignUpdateFormData(dragged, { sagaId: toSagaId, order: toOrder }));
          }
        } catch (err) {
          console.error('Error moviendo campaña', err);
          // Best-effort refresh (both sagas)
          try {
            const [a, b] = await Promise.all([
              getCampaignsBySaga(fromSagaId),
              getCampaignsBySaga(toSagaId),
            ]);
            setCampaigns(prev => prev
              .filter(c => c.sagaId !== fromSagaId && c.sagaId !== toSagaId)
              .concat(a)
              .concat(b)
            );
          } catch (e) {
            console.error('Error recargando campañas tras fallo', e);
          }
        }
        return;
      }

      // ---- Saga drag/drop ----
      if (isNumericId(activeId) && isNumericId(overId)) {
        const oldIndex = sagas.findIndex(s => s.id === Number(activeId));
        const newIndex = sagas.findIndex(s => s.id === Number(overId));
        if (oldIndex === -1 || newIndex === -1) return;
        const reordered = arrayMove(sagas, oldIndex, newIndex);
        setSagas(reordered);
        const ids = reordered.map((s) => Number(s.id));
        try {
          await fetch(`${API_URL}/order`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
          });
        } catch (err) {
          console.error('Error reordenando sagas', err);
        }
      }
    };

    const handleDragCancel = (event: any) => {
      const activeId = String(event?.active?.id ?? '');
      if (activeId.startsWith('campaign:')) {
        suppressCampaignOpenUntilRef.current = Date.now() + 350;
      }
    };
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  // Collapsible saga state: by default, everything is collapsed
  const [expandedSagaIds, setExpandedSagaIds] = useState<Set<number>>(() => new Set());

  async function fetchSagas() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setSagas(data || []);
    } catch (err) {
      console.error('Error fetching sagas', err);
    }
  }

  useEffect(() => {
    fetchSagas();
  }, []);

  // Cargar campañas de todas las sagas
  useEffect(() => {
    async function fetchAllCampaigns() {
      let all: Campaign[] = [];
      for (const saga of sagas) {
        const c = await getCampaignsBySaga(saga.id);
        all = all.concat(c);
      }
      setCampaigns(all);
    }
    if (sagas.length) fetchAllCampaigns();
    else setCampaigns([]);
  }, [sagas]);

  // Cargar capítulos (global) para poder contar por campaña en las tarjetas
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await getAllChapters();
        if (cancelled) return;
			const normalizeNameForCompare = (value: any) => {
				return String(value ?? '')
					.trim()
					.toLowerCase()
					.normalize('NFD')
					.replace(/[\u0300-\u036f]/g, '');
			};
			const isCredits = (ch: any) => {
				if (String(ch?.specialType ?? '') === 'CREDITS') return true;
				const name = normalizeNameForCompare(ch?.name);
				return name === 'creditos' || name === 'credits';
			};
        const counts: Record<number, number> = {};
        (all ?? []).forEach((ch) => {
			if (isCredits(ch)) return;
          const key = Number((ch as any).campaignId);
          if (Number.isNaN(key)) return;
          counts[key] = (counts[key] || 0) + 1;
        });
        setChaptersByCampaignId(counts);
      } catch (e) {
        if (cancelled) return;
        setChaptersByCampaignId({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Drag and drop handlers removed

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { ids, ...formData } = (form as any);
      if (editingId !== null) {
        await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        setEditingId(null);
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setForm({ name: '', description: '' });
      setShowModal(false);
      fetchSagas();
    } catch (err) {
      console.error('Error saving saga', err);
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchSagas();
    } catch (err) {
      console.error('Error deleting saga', err);
    }
  }

  let filteredSagas: SagaType[] = [];
  let filteredCampaignsBySaga: Record<number, Campaign[]> = {};
  if (search.trim()) {
    const searchTerm = search.trim().toLowerCase();
    filteredSagas = sagas.filter(s => {
      const sagaMatch = s.name.toLowerCase().includes(searchTerm) || (s.description || '').toLowerCase().includes(searchTerm);
      const matchingCampaigns = campaigns.filter(c =>
        c.sagaId === s.id && (
          c.name.toLowerCase().includes(searchTerm) ||
          (c.description || '').toLowerCase().includes(searchTerm)
        )
      );
      if (sagaMatch) {
        // Si la saga coincide, mostrar todas sus campañas
        filteredCampaignsBySaga[s.id] = campaigns.filter(c => c.sagaId === s.id);
        return true;
      } else if (matchingCampaigns.length > 0) {
        filteredCampaignsBySaga[s.id] = matchingCampaigns;
        return true;
      }
      return false;
    });
  } else {
    filteredSagas = sagas;
    filteredSagas.forEach(s => {
      filteredCampaignsBySaga[s.id] = campaigns.filter(c => c.sagaId === s.id);
    });
  }

  // --- UI ---
  return (
    <>
    <div className="panel panel-corners-soft block-border block-panel-border">
      {/* Esquinas decorativas */}
      <div className="panel-sticky-header">
        <div className="panel-header">
          <h1>CPManager</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="icon"
              aria-label="Facciones"
              title="Facciones"
              onClick={() => onOpenFactions?.()}
            >
              <FaFlag size={26} color="#FFD700" />
            </button>
            <button
              className="icon"
              aria-label="Clases"
              title="Clases"
              onClick={() => onOpenClasses?.()}
            >
              <GiCrossedSwords size={26} color="#FFD700" />
            </button>
            <button
              className="icon"
              aria-label="Personajes"
              title="Personajes"
              onClick={() => onOpenCharacters?.()}
            >
              <FaUser size={26} color="#FFD700" />
            </button>
            <button
              className="icon"
              aria-label="Profesiones"
              title="Profesiones"
              onClick={() => onOpenProfessions?.()}
            >
              <GiWarPick size={26} color="#FFD700" />
            </button>
            <button
              className="icon"
              aria-label="Objetos"
              title="Objetos"
              onClick={() => onOpenObjects?.()}
            >
              <GiChest size={26} color="#FFD700" />
            </button>
            <button
              className="icon"
              aria-label="Recursos"
              title="Recursos"
              onClick={() => onOpenResources?.()}
            >
              <FaMountain size={26} color="#FFD700" />
            </button>
            <button
              className="icon"
              aria-label="Componentes"
              title="Componentes"
              onClick={() => onOpenComponents?.()}
            >
              <FaCubes size={26} color="#FFD700" />
            </button>
            <button
              className="icon"
              aria-label="Mecánicas"
              title="Mecánicas"
              onClick={() => onOpenMechanics?.()}
            >
              <FaCogs size={26} color="#FFD700" />
            </button>
            <button
              className="icon"
              aria-label="Mapas"
              title="Mapas"
              onClick={() => onOpenMaps?.()}
            >
              <FaCompass size={26} color="#FFD700" />
            </button>
            <button
              className="icon"
              aria-label="Nueva Saga"
              title="Nueva Saga"
              onClick={() => {
                setShowModal(true);
                setEditingId(null);
                setForm({ name: '', description: '' });
              }}
            >
              <FaBookOpen size={28} color="#FFD700" />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Buscar saga..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: 8 }}
          />
          <button
            className="icon"
            type="button"
            aria-label={dndEnabled ? 'Deshabilitar drag and drop' : 'Habilitar drag and drop'}
            title={dndEnabled ? 'Deshabilitar drag and drop' : 'Habilitar drag and drop'}
            onClick={() => setDndEnabled((prev) => !prev)}
            style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {dndEnabled ? <FaLockOpen size={22} color="#FFD700" title="Drag and drop habilitado" /> : <FaLock size={22} color="#FFD700" title="Drag and drop deshabilitado" />}
          </button>
        </div>
        {search.trim() ? (
          <div style={{ marginTop: -8, marginBottom: 16, opacity: 0.9, fontSize: 13 }}>
            Resultados: {filteredSagas.length}
          </div>
        ) : null}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={undefined}
        onDragCancel={dndEnabled ? handleDragCancel : undefined}
        onDragEnd={dndEnabled ? handleDragEnd : undefined}
      >
        <SortableContext
          items={filteredSagas.map(s => s.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="saga-list">
            {filteredSagas.map((saga) => {
              const expanded = expandedSagaIds.has(saga.id);
              const hasDescription = Boolean((saga.description ?? '').trim());
              const sagaCampaignsAll = campaigns.filter(c => c.sagaId === saga.id);
              const hasCampaigns = sagaCampaignsAll.length > 0;
              const hasIncompleteCampaigns = sagaCampaignsAll.some((c) => {
                const chapterCount = chaptersByCampaignId[c.id] ?? 0;
                const hasCDescription = Boolean((c.description ?? '').trim());
                const hasCImage = Boolean(c.image);
                const hasCFile = Boolean(c.file);
                const hasCChapters = chapterCount > 0;
                return !hasCDescription || !hasCImage || !hasCFile || !hasCChapters;
              });

              const missing: string[] = [];
              if (!hasDescription) missing.push('descripción');
              if (!hasCampaigns) missing.push('campañas');
              if (hasIncompleteCampaigns) missing.push('campañas incompletas');

              const showWarning = missing.length > 0;
              const warningText =
                missing.length === 1 && missing[0] === 'campañas incompletas'
                  ? 'Esta saga tiene campañas incompletas.'
                  : `Falta: ${missing.join(', ')}.`;

              return (
                <SortableSagaCard
                  key={saga.id}
                  saga={saga}
                  dndEnabled={dndEnabled}
                >
                  <div className="saga-card-header">
                    <button
                      type="button"
                      className="icon option saga-toggle"
                      aria-label={expanded ? 'Colapsar saga' : 'Expandir saga'}
                      title={expanded ? 'Colapsar' : 'Expandir'}
                      onPointerDown={(e) => {
                        // Evita iniciar drag al intentar desplegar
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedSagaIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(saga.id)) next.delete(saga.id);
                          else next.add(saga.id);
                          return next;
                        });
                      }}
                      style={{ marginRight: 8 }}
                    >
                      {expanded ? <FaChevronDown size={18} /> : <FaChevronRight size={18} />}
                    </button>
                    <h3 className="saga-name" style={{ textAlign: 'left', flex: 1, margin: 0, minWidth: 0 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{saga.name}</span>
                        {showWarning ? (
                          <span
                            className="saga-warning"
                            title={warningText}
                            aria-label={warningText}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FaExclamationTriangle size={16} />
                          </span>
                        ) : null}
                      </span>
                    </h3>
                    <div className="saga-actions-top">
                      {campaigns.filter(c => c.sagaId === saga.id).length < 4 && (
                        <button className="icon option" title="Añadir campaña" onClick={() => {
                          const usedOrders = new Set(campaigns.filter(c => c.sagaId === saga.id).map(c => c.order ?? 0));
                          const firstFree = [0, 1, 2, 3].find(n => !usedOrders.has(n)) ?? 0;
                          setCampaignInitial({ sagaId: saga.id, order: firstFree });
                          setCampaignSagaId(saga.id);
                          setCampaignModalOpen(true);
                        }}>
                          <FaCampground size={18} />
                        </button>
                      )}
                      <button className="icon option" title="Editar" onClick={() => {
                        setEditingId(saga.id);
                        setForm({ name: saga.name, description: saga.description });
                        setShowModal(true);
                      }}>
                        <FaEdit size={18} />
                      </button>
                      <button className="icon option" title="Eliminar" onClick={() => {
                        setPendingDeleteId(saga.id);
                        setConfirmOpen(true);
                      }}>
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </div>
                  {expanded ? (
                    <div className="saga-card-body">
                      <p className="saga-desc">{saga.description}</p>
                      <div className="campaigns-responsive-table">
                        {[0, 1, 2, 3].map((idx) => {
                          const sagaCampaigns = campaigns
                            .filter(c => c.sagaId === saga.id)
                            .slice()
                            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id);

                          const byOrder = new Map<number, Campaign>();
                          sagaCampaigns.forEach((c, i) => {
                            const ord = (typeof c.order === 'number' ? c.order : i);
                            if (!byOrder.has(ord)) byOrder.set(ord, c);
                          });

                          const cellCampaign = byOrder.get(idx) ?? null;
                          const visibleIds = new Set((filteredCampaignsBySaga[saga.id] ?? []).map(c => c.id));
                          const shouldRender = !search.trim() || (cellCampaign ? visibleIds.has(cellCampaign.id) : false);

                          const cellId = `cell:${saga.id}:${idx}`;
                          return (
                            <CampaignCell key={idx} id={cellId}>
                              {cellCampaign && shouldRender ? (
                                <DraggableCampaign campaign={cellCampaign} enabled={dndEnabled}>
                                  <CampaignCard
                                    campaign={cellCampaign}
                                    chapterCount={chaptersByCampaignId[cellCampaign.id] ?? 0}
                                    onOpen={() => {
                                      if (shouldSuppressCampaignOpen()) return;
                                      onOpenCampaign?.(cellCampaign.id);
                                    }}
                                    onEdit={() => {
                                      setCampaignInitial(cellCampaign);
                                      setCampaignSagaId(saga.id);
                                      setCampaignModalOpen(true);
                                    }}
                                    onDelete={() => {
                                      setPendingDeleteCampaign(cellCampaign);
                                      setConfirmCampaignOpen(true);
                                    }}
                                  />
                                </DraggableCampaign>
                              ) : null}
                            </CampaignCell>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </SortableSagaCard>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Modal de edición/creación de campaña */}
      {campaignModalOpen && (
        <CampaignModal
          open={campaignModalOpen}
          initial={campaignInitial}
          campaigns={campaigns}
          onSubmit={async (formData) => {
            if (campaignInitial && campaignInitial.id) {
              // Actualizar campaña
              await updateCampaign(campaignInitial.id, formData);
            } else {
              // Crear nueva campaña
              await createCampaign(formData);
            }
            setCampaignModalOpen(false);
            setCampaignInitial(undefined);
            setCampaignSagaId(null);
            // Recargar campañas
            if (campaignSagaId) {
              const c = await getCampaignsBySaga(campaignSagaId);
              setCampaigns(prev => prev.filter(ca => ca.sagaId !== campaignSagaId).concat(c));
            }
          }}
          onClose={() => {
            setCampaignModalOpen(false);
            setCampaignInitial(undefined);
            setCampaignSagaId(null);
          }}
        />
      )}
      <ConfirmModal
        open={confirmOpen}
        message={"¿Estás seguro de que deseas eliminar esta saga?"}
        onConfirm={() => {
          if (pendingDeleteId !== null) {
            handleDelete(pendingDeleteId);
            setPendingDeleteId(null);
          }
          setConfirmOpen(false);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
      />

      <ConfirmModal
        open={confirmCampaignOpen}
        message={"¿Estás seguro de que deseas eliminar esta campaña?"}
        onConfirm={async () => {
          if (!pendingDeleteCampaign?.id) {
            setConfirmCampaignOpen(false);
            setPendingDeleteCampaign(null);
            return;
          }
          const idToDelete = pendingDeleteCampaign.id;
          try {
            await deleteCampaign(idToDelete);
            setCampaigns(prev => prev.filter(c => c.id !== idToDelete));
          } catch (err) {
            console.error('Error eliminando campaña', err);
          } finally {
            setConfirmCampaignOpen(false);
            setPendingDeleteCampaign(null);
          }
        }}
        onCancel={() => {
          setConfirmCampaignOpen(false);
          setPendingDeleteCampaign(null);
        }}
      />
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="icon option" onClick={() => setShowModal(false)} title="Cerrar">
              <FaTimes size={18} />
            </button>
            <h2 className="modal-title">
              {editingId ? 'Editar Saga' : 'Nueva Saga'}
            </h2>
            <form onSubmit={handleSubmit} autoComplete="off">
              <input
                name="name"
                placeholder="Name"
                value={form.name || ''}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description || ''}
                onChange={handleChange}
                autoComplete="off"
              />
              <div className="actions">
                <button type="submit" className='confirm'>
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  className="cancel"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setForm({ name: '', description: '' });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
};


export default SagaPanel;
