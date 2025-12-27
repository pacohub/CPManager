import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, closestCenter, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaArrowLeft, FaDownload, FaEdit, FaExclamation, FaExclamationTriangle, FaFilm, FaLock, FaLockOpen, FaPlus, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import ChapterModal from '../components/ChapterModal';
import EventModal from '../components/EventModal';
import ObjectiveModal from '../components/ObjectiveModal';
import { Chapter } from '../interfaces/chapter';
import { EventItem } from '../interfaces/event';
import { MechanicItem } from '../interfaces/mechanic';
import { MapItem } from '../interfaces/map';
import { ObjectiveItem } from '../interfaces/objective';
import { deleteChapter, getChapter, updateChapter } from './chapterApi';
import { getMechanics } from './mechanicApi';
import { getMaps } from './mapApi';
import { createEvent, deleteEvent, getEvents, updateEvent } from './eventApi';
import { createObjective, deleteObjective, getObjectives, updateObjective } from './objectiveApi';

interface Props {
	chapterId: number;
	onBack: () => void;
}

interface SortableEventCardProps {
	event: EventItem;
	enabled: boolean;
	children: (dragHandleProps: { attributes: any; listeners: any } | null) => React.ReactNode;
}

const SortableEventCard: React.FC<SortableEventCardProps> = ({ event, enabled, children }) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: `event:${event.id}`,
		disabled: !enabled,
	});

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition: transition || undefined,
		boxShadow: isDragging ? '0 0 10px #FFD700' : undefined,
		opacity: isDragging ? 0.85 : 1,
		cursor: enabled ? 'grab' : undefined,
	};


	return (
		<div ref={setNodeRef} style={style} {...(enabled ? { ...attributes, ...listeners } : {})}>
			{children(null)}
		</div>
	);
};

const ObjectiveListDropZone: React.FC<{ eventId: number; enabled: boolean; children: React.ReactNode }> = ({ eventId, enabled, children }) => {
	const { setNodeRef } = useDroppable({
		id: `objlist:${eventId}`,
		disabled: !enabled,
		data: { type: 'objlist', eventId },
	});
	return (
		<div ref={setNodeRef} style={{ minHeight: 18 }}>
			{children}
		</div>
	);
};

interface SortableObjectiveRowProps {
	objective: ObjectiveItem;
	enabled: boolean;
	children: React.ReactNode;
}

const SortableObjectiveRow: React.FC<SortableObjectiveRowProps> = ({ objective, enabled, children }) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: `objective:${objective.id}`,
		disabled: !enabled,
		data: {
			type: 'objective',
			eventId: Number((objective as any).eventId ?? objective.event?.id),
		},
	});

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition: transition || undefined,
		opacity: isDragging ? 0.75 : 1,
		position: isDragging ? 'relative' : undefined,
		zIndex: isDragging ? 30 : undefined,
		cursor: enabled ? 'grab' : 'pointer',
	};

	return (
		<div ref={setNodeRef} style={style} {...(enabled ? { ...attributes, ...listeners } : {})}>
			{children}
		</div>
	);
};

const stripLeadingSlashes = (value: string) => {
	let next = value;
	while (next.startsWith('/')) next = next.slice(1);
	return next;
};

const fileUrl = (file?: string) => {
	if (!file) return null;
	if (file.startsWith('http')) return file;
	return `http://localhost:4000/${stripLeadingSlashes(file)}`;
};

const imageUrl = (img?: string) => {
	if (!img) return null;
	if (img.startsWith('http') || img.startsWith('data:')) return img;
	return `http://localhost:4000/${stripLeadingSlashes(img)}`;
};

const ChapterEventsView: React.FC<Props> = ({ chapterId, onBack }) => {
	const [chapter, setChapter] = useState<Chapter | null>(null);
	const [maps, setMaps] = useState<MapItem[]>([]);
	const [mechanics, setMechanics] = useState<MechanicItem[]>([]);
	const [events, setEvents] = useState<EventItem[]>([]);
	const [objectives, setObjectives] = useState<ObjectiveItem[]>([]);
	const [search, setSearch] = useState('');
	const [eventsDndEnabled, setEventsDndEnabled] = useState(false);
	const [filterEasy, setFilterEasy] = useState(true);
	const [filterNormal, setFilterNormal] = useState(true);
	const [filterHard, setFilterHard] = useState(true);

	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<EventItem> | undefined>(undefined);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<EventItem | null>(null);

	const [objectiveModalOpen, setObjectiveModalOpen] = useState(false);
	const [objectiveInitial, setObjectiveInitial] = useState<Partial<ObjectiveItem> | undefined>(undefined);
	const [objectiveEventId, setObjectiveEventId] = useState<number | null>(null);
	const [confirmObjectiveOpen, setConfirmObjectiveOpen] = useState(false);
	const [pendingDeleteObjective, setPendingDeleteObjective] = useState<ObjectiveItem | null>(null);
	const [expandedObjectiveId, setExpandedObjectiveId] = useState<number | null>(null);
	const [activeDragId, setActiveDragId] = useState<string | null>(null);

	const [chapterModalOpen, setChapterModalOpen] = useState(false);
	const [confirmChapterOpen, setConfirmChapterOpen] = useState(false);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
	);

	useEffect(() => {
		getChapter(chapterId).then(setChapter).catch((e) => console.error('Error cargando capítulo', e));
	}, [chapterId]);

	useEffect(() => {
		getMaps().then((list) => setMaps(list ?? [])).catch((e) => {
			console.error('Error cargando mapas', e);
			setMaps([]);
		});
	}, []);

	useEffect(() => {
		getMechanics().then((list) => setMechanics(list ?? [])).catch((e) => {
			console.error('Error cargando mecánicas', e);
			setMechanics([]);
		});
	}, []);

	const refresh = useCallback(async () => {
		const list = await getEvents({ chapterId });
		setEvents(list || []);
	}, [chapterId]);

	const refreshObjectives = useCallback(async () => {
		const list = await getObjectives({ chapterId });
		setObjectives(list || []);
	}, [chapterId]);

	useEffect(() => {
		refresh().catch((e) => console.error('Error cargando eventos', e));
	}, [refresh]);

	useEffect(() => {
		refreshObjectives().catch((e) => console.error('Error cargando objetivos', e));
	}, [refreshObjectives]);

	const ordered = useMemo(() => {
		return (events || [])
			.slice()
			.sort((a, b) => (Number(a.position ?? 0) - Number(b.position ?? 0)) || (a.id - b.id));
	}, [events]);

	const objectivesByEventId = useMemo(() => {
		const out: Record<number, ObjectiveItem[]> = {};
		for (const obj of objectives || []) {
			const id = Number((obj as any).eventId ?? obj.event?.id);
			if (!Number.isFinite(id)) continue;
			if (!out[id]) out[id] = [];
			out[id].push(obj);
		}
		for (const key of Object.keys(out)) {
			const id = Number(key);
			out[id] = out[id]
				.slice()
				.sort((a, b) => (Number(a.position ?? 0) - Number(b.position ?? 0)) || (a.id - b.id));
		}
		return out;
	}, [objectives]);

	const isDifficultyFilteringActive = !(filterEasy && filterNormal && filterHard);
	const isFilteringActive = Boolean(search.trim()) || isDifficultyFilteringActive;

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const allowedDifficulties = new Set<string>([
			...(filterEasy ? ['EASY'] : []),
			...(filterNormal ? ['NORMAL'] : []),
			...(filterHard ? ['HARD'] : []),
		]);

		const passesDifficulty = (ev: EventItem) => {
			if (ev.type === 'CINEMATIC') return true;
			return allowedDifficulties.has(String(ev.difficulty || 'NORMAL'));
		};

		const matchesText = (ev: EventItem) => {
			if (!q) return true;
			const mapName = (ev.map?.name ?? '').toLowerCase();
			return (
				(ev.name || '').toLowerCase().includes(q) ||
				(ev.description || '').toLowerCase().includes(q) ||
				(ev.type || '').toLowerCase().includes(q) ||
				(ev.difficulty || '').toLowerCase().includes(q) ||
				mapName.includes(q)
			);
		};

		const objectiveMatches = (ev: EventItem) => {
			if (ev.type !== 'MISSION') return false;
			const list = objectivesByEventId[ev.id] || [];
			if (list.length === 0) return false;
			return list.some((o) => {
				const diffOk = !isDifficultyFilteringActive || allowedDifficulties.has(String(o.difficulty || 'NORMAL'));
				if (!diffOk) return false;
				if (!q) return true;
				const mechanicName = (o.mechanic?.name || '').toLowerCase();
				return (
					(o.name || '').toLowerCase().includes(q) ||
					(o.description || '').toLowerCase().includes(q) ||
					(o.detailedDescription || '').toLowerCase().includes(q) ||
					mechanicName.includes(q)
				);
			});
		};

		return ordered.filter((ev) => (passesDifficulty(ev) && matchesText(ev)) || objectiveMatches(ev));
	}, [ordered, objectivesByEventId, isDifficultyFilteringActive, search, filterEasy, filterNormal, filterHard]);

	const toLabelDifficulty = (d: string) => (d === 'EASY' ? 'Fácil' : d === 'HARD' ? 'Difícil' : 'Normal');

	const getObjectiveEventId = (obj?: ObjectiveItem | null) => {
		if (!obj) return NaN;
		return Number((obj as any).eventId ?? obj.event?.id);
	};

	const activeObjective = useMemo(() => {
		if (!activeDragId) return null;
		if (!activeDragId.startsWith('objective:')) return null;
		const id = Number(activeDragId.replace('objective:', ''));
		return objectives.find((o) => o.id === id) ?? null;
	}, [activeDragId, objectives]);

	const dndEnabled = eventsDndEnabled && !isFilteringActive;

	return (
		<div className={`panel panel-corners-soft block-border block-panel-border${dndEnabled ? ' dnd-noselect' : ''}`}>
			<div className="panel-header">
				<button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
					<FaArrowLeft size={22} color="#FFD700" />
				</button>
				<h1 style={{ margin: 0, minWidth: 0, wordBreak: 'break-word' }}>
					{chapter
						? `${Number.isFinite(chapter.order) ? `Capítulo ${(chapter.order ?? 0) + 1}: ` : ''}${chapter.name}`
						: 'Capítulo'}
				</h1>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<button
						className="icon option"
						title="Editar"
						disabled={!chapter}
						onClick={() => {
							if (!chapter) return;
							setChapterModalOpen(true);
						}}
					>
						<FaEdit size={18} />
					</button>
					<button
						className="icon option"
						title="Eliminar"
						disabled={!chapter}
						onClick={() => {
							if (!chapter) return;
							setConfirmChapterOpen(true);
						}}
					>
						<FaTrash size={18} />
					</button>
				</div>
			</div>

			<div style={{ padding: '12px 12px 10px 12px' }}>
				{chapter ? (
					<div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
						<div style={{ flex: '1 1 320px', minWidth: 240 }}>
							{chapter.description ? (
								<div style={{ opacity: 0.95, whiteSpace: 'pre-wrap' }}>{chapter.description}</div>
							) : null}
							{chapter.file ? (
								<div style={{ marginTop: 8, fontSize: 13, opacity: 0.95 }}>
									Archivo: <a href={fileUrl(chapter.file) ?? undefined} target="_blank" rel="noopener noreferrer">{chapter.file}</a>
								</div>
							) : null}
						</div>

						{chapter.image ? (
							<div style={{ flex: '0 0 auto' }}>
								<img
									src={imageUrl(chapter.image) ?? undefined}
									alt={chapter.name}
									style={{ width: 800, height: 600, maxWidth: '100%', objectFit: 'cover', borderRadius: 10 }}
								/>
							</div>
						) : null}
					</div>
				) : (
					<div style={{ opacity: 0.85 }}>Cargando capítulo...</div>
				)}
			</div>

			<div style={{ padding: '0 12px 6px 12px', fontWeight: 800 }}>Eventos</div>

			<div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px 12px 12px', flexWrap: 'wrap' }}>
				<input
					type="text"
					placeholder="Buscar evento..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					style={{ flex: '1 1 260px', padding: 8, minWidth: 220 }}
				/>

				<div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, opacity: 0.95, flexWrap: 'wrap' }}>
					<label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} title="Mostrar eventos de dificultad Fácil">
						<input type="checkbox" checked={filterEasy} onChange={(e) => setFilterEasy(e.target.checked)} />
						Fácil
					</label>
					<label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} title="Mostrar eventos de dificultad Normal">
						<input type="checkbox" checked={filterNormal} onChange={(e) => setFilterNormal(e.target.checked)} />
						Normal
					</label>
					<label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} title="Mostrar eventos de dificultad Difícil">
						<input type="checkbox" checked={filterHard} onChange={(e) => setFilterHard(e.target.checked)} />
						Difícil
					</label>
				</div>

				<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<button
						className="icon"
						aria-label="Nuevo Evento"
						title="Nuevo Evento"
						onClick={() => {
							setInitial(undefined);
							setModalOpen(true);
						}}
					>
						<FaPlus size={18} color="#FFD700" />
					</button>
					<button
						className="icon"
						aria-label={eventsDndEnabled ? 'Deshabilitar reordenamiento' : 'Habilitar reordenamiento'}
						title={isFilteringActive ? 'Desactiva filtros / limpia búsqueda para reordenar' : (eventsDndEnabled ? 'Deshabilitar reordenamiento' : 'Habilitar reordenamiento')}
						onClick={() => {
							if (isFilteringActive) return;
							setEventsDndEnabled((v) => !v);
						}}
						style={{ opacity: isFilteringActive ? 0.5 : 1 }}
					>
						{eventsDndEnabled ? <FaLockOpen size={18} color="#FFD700" /> : <FaLock size={18} color="#FFD700" />}
					</button>
				</div>
			</div>

			<div style={{ padding: 12 }}>
				{filtered.length === 0 ? (
					<div style={{ opacity: 0.8, color: '#e2d9b7' }}>No hay eventos todavía.</div>
				) : (
					<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragStart={(event) => {
								setActiveDragId(String(event.active?.id ?? ''));
							}}
							onDragCancel={() => {
								setActiveDragId(null);
							}}
							onDragEnd={async (event) => {
								setActiveDragId(null);
									if (!eventsDndEnabled) return;
									if (isFilteringActive) return;
									const { active, over } = event;
									if (!over) return;
									if (active.id === over.id) return;

									const activeId = String(active.id);
									const overId = String(over.id);

									// Objectives DnD
									if (activeId.startsWith('objective:')) {
										const activeObjId = Number(activeId.replace('objective:', ''));
										const activeObj = objectives.find((o) => o.id === activeObjId);
										if (!activeObj) return;
										const fromEventId = getObjectiveEventId(activeObj);
										if (!Number.isFinite(fromEventId)) return;

										let toEventId = fromEventId;
										let overObjectiveId: number | null = null;
										if (overId.startsWith('objective:')) {
											overObjectiveId = Number(overId.replace('objective:', ''));
											const overObj = objectives.find((o) => o.id === overObjectiveId);
											if (!overObj) return;
											toEventId = getObjectiveEventId(overObj);
										} else if (overId.startsWith('objlist:')) {
											toEventId = Number(overId.replace('objlist:', ''));
										} else if (overId.startsWith('event:')) {
											toEventId = Number(overId.replace('event:', ''));
										} else {
											return;
										}

										const toEvent = events.find((e) => e.id === toEventId);
										if (!toEvent || toEvent.type !== 'MISSION') return;

										const fromList = (objectivesByEventId[fromEventId] || [])
											.slice()
											.sort((a, b) => (Number(a.position ?? 0) - Number(b.position ?? 0)) || (a.id - b.id));
										const toList = (fromEventId === toEventId ? fromList : (objectivesByEventId[toEventId] || [])
											.slice()
											.sort((a, b) => (Number(a.position ?? 0) - Number(b.position ?? 0)) || (a.id - b.id)));

										const fromIndex = fromList.findIndex((o) => o.id === activeObjId);
										if (fromIndex < 0) return;

										let insertIndex = toList.length;
										if (overObjectiveId !== null) {
											const idx = toList.findIndex((o) => o.id === overObjectiveId);
											if (idx >= 0) insertIndex = idx;
										}

										let updates: Array<{ id: number; eventId: number; position: number }> = [];

										if (fromEventId === toEventId && overObjectiveId !== null) {
											const toIndex = toList.findIndex((o) => o.id === overObjectiveId);
											if (toIndex < 0) return;
											const nextList = arrayMove(toList, fromIndex, toIndex).map((o, pos) => ({ ...o, position: pos, eventId: fromEventId } as any));
											updates = nextList.map((o) => ({ id: o.id, eventId: fromEventId, position: Number(o.position ?? 0) }));
										} else {
											const moving = { ...fromList[fromIndex], eventId: toEventId } as any;
											const nextFrom = fromList.filter((_, i) => i !== fromIndex).map((o, pos) => ({ ...o, position: pos, eventId: fromEventId } as any));
											const baseTo = fromEventId === toEventId ? nextFrom : toList;
											const nextTo = baseTo.slice();
											nextTo.splice(insertIndex, 0, moving);
											const nextToFixed = nextTo.map((o, pos) => ({ ...o, position: pos, eventId: toEventId } as any));

											updates = [
												...nextFrom.map((o) => ({ id: o.id, eventId: fromEventId, position: Number(o.position ?? 0) })),
												...nextToFixed.map((o) => ({ id: o.id, eventId: toEventId, position: Number(o.position ?? 0) })),
											];
										}

										setObjectives((prev) => {
											const byId = new Map(updates.map((u) => [u.id, u]));
											return prev.map((o) => {
												const u = byId.get(o.id);
												return u ? ({ ...o, eventId: u.eventId, position: u.position } as any) : o;
											});
										});

										try {
											for (const u of updates) {
												await updateObjective(u.id, { eventId: u.eventId, position: u.position });
											}
										} catch (e) {
											console.error('Error guardando orden de objetivos', e);
											await refreshObjectives();
										}
										return;
									}

									// Events DnD
									if (!activeId.startsWith('event:')) return;
									const activeEventId = Number(activeId.replace('event:', ''));
									let overEventId: number | null = null;
									if (overId.startsWith('event:')) {
										overEventId = Number(overId.replace('event:', ''));
									} else if (overId.startsWith('objlist:')) {
										overEventId = Number(overId.replace('objlist:', ''));
									} else if (overId.startsWith('objective:')) {
										const overObjId = Number(overId.replace('objective:', ''));
										const overObj = objectives.find((o) => o.id === overObjId);
										overEventId = Number.isFinite(getObjectiveEventId(overObj)) ? getObjectiveEventId(overObj) : null;
									}
									if (overEventId === null) return;
									const base = ordered;
									const oldIndex = base.findIndex((e) => e.id === activeEventId);
									const newIndex = base.findIndex((e) => e.id === overEventId);
									if (oldIndex < 0 || newIndex < 0) return;

									const next = arrayMove(base, oldIndex, newIndex).map((e, idx) => ({ ...e, position: idx }));
									setEvents(next);

									try {
										for (let idx = 0; idx < next.length; idx++) {
											await updateEvent(next[idx].id, { position: idx });
										}
									} catch (e) {
										console.error('Error guardando orden de eventos', e);
										await refresh();
									}
								}}
							>
								<SortableContext items={filtered.map((ev) => `event:${ev.id}`)} strategy={verticalListSortingStrategy}>
									<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
										{filtered.map((ev, idx) => {
											const url = fileUrl(ev.file);
											const mapId = Number((ev as any).mapId ?? ev.map?.id);
											const prev = idx > 0 ? filtered[idx - 1] : undefined;
											const prevMapId = prev ? Number((prev as any).mapId ?? prev.map?.id) : NaN;
											const showMapBlock = idx === 0 || (!Number.isNaN(mapId) && !Number.isNaN(prevMapId) ? mapId !== prevMapId : true);

											const mapFromList = Number.isNaN(mapId) ? undefined : maps.find((m) => m.id === mapId);
											const mapName = ev.map?.name ?? mapFromList?.name ?? '';
											const mapImage = ev.map?.image ?? mapFromList?.image;
											const mapImageUrl = imageUrl(mapImage);
											const showMapWarning = !String(mapName || '').trim();
											const mapWarningText = 'Este evento no tiene mapa asociado.';

											const isMission = ev.type === 'MISSION';
											const icon = isMission ? <FaExclamation size={16} color="#FFD700" /> : <FaFilm size={16} color="#FFD700" />;
											const showDifficultyText = isMission && (ev.difficulty === 'NORMAL' || ev.difficulty === 'HARD');
											const difficultyText = showDifficultyText ? toLabelDifficulty(String(ev.difficulty)) : '';
											const showDescriptionWarning = !String(ev.description ?? '').trim();
											const descriptionWarningText = 'Este evento no tiene descripción.';

											const objectivesForEvent = (objectivesByEventId[ev.id] || [])
												.slice()
												.sort((a, b) => (Number(a.position ?? 0) - Number(b.position ?? 0)) || (a.id - b.id));
												const dndEnabled = eventsDndEnabled && !isFilteringActive;

											const renderCard = (
												dragHandleProps: { attributes: any; listeners: any } | null,
											) => (
												<div className="block-border block-border-soft event-card" style={{ padding: 12, position: 'relative' }}>
													<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
														<div style={{ minWidth: 0, flex: 1 }}>
															<div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
																<span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
																	<div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
																		<div style={{ fontWeight: 800, minWidth: 0, wordBreak: 'break-word' }}>{ev.name}</div>
																		{showDifficultyText ? (
																			<span style={{ fontSize: 12, opacity: 0.9, whiteSpace: 'nowrap' }}>{difficultyText}</span>
																		) : null}
																		{showDescriptionWarning ? (
																			<span
																				className="saga-warning"
																				title={descriptionWarningText}
																				aria-label={descriptionWarningText}
																				onPointerDown={(e) => e.stopPropagation()}
																				onClick={(e) => e.stopPropagation()}
																			>
																				<FaExclamationTriangle size={16} />
																			</span>
																		) : null}
																	</div>
																</div>

																{ev.description ? <div style={{ opacity: 0.9, marginTop: 6 }}>{ev.description}</div> : null}
																{url ? (
																	<div style={{ marginTop: 6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
																		<a href={url} target="_blank" rel="noopener noreferrer">{ev.file}</a>
																	</div>
																) : null}

																{isMission ? (
																	<div style={{ marginTop: 10 }}>
																		<div style={{ fontWeight: 800, opacity: 0.95 }}>Objetivos</div>
																		<ObjectiveListDropZone eventId={ev.id} enabled={dndEnabled}>
																			<div
																				style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}
																				onPointerDown={(e) => {
																					// Importante: evita que el evento (tarjeta) inicie drag cuando se está interactuando con objetivos.
																					e.stopPropagation();
																				}}
																			>
																				<SortableContext items={objectivesForEvent.map((o) => `objective:${o.id}`)} strategy={verticalListSortingStrategy}>
																					{objectivesForEvent.length === 0 ? (
																						<div style={{ opacity: 0.8, fontSize: 13 }}>No hay objetivos todavía.</div>
																					) : null}
																					{objectivesForEvent.map((o) => {
																						const mechanicName = o.mechanic?.name || '';
																						const showObjectiveDifficultyText = String(o.difficulty || 'EASY') !== 'EASY';
																						const objectiveDifficultyText = showObjectiveDifficultyText
																							? toLabelDifficulty(String(o.difficulty || 'EASY'))
																							: '';
																						const showObjectiveDescriptionWarning = !String(o.description ?? '').trim();
																						const showObjectiveDetailedWarning = !String(o.detailedDescription ?? '').trim();
																						const objectiveDescWarningText = 'Este objetivo no tiene descripción.';
																						const objectiveDetailedWarningText = 'Este objetivo no tiene descripción detallada.';

																						return (
																							<SortableObjectiveRow key={o.id} objective={o} enabled={dndEnabled}>
																								<div className="objective-row" onClick={() => setExpandedObjectiveId((prev) => (prev === o.id ? null : o.id))}>
																									<div className="objective-stripe" aria-hidden="true" />
																									<div className="objective-toggle" aria-hidden="true">
																										{expandedObjectiveId === o.id ? '▾' : '▸'}
																									</div>
																									<div style={{ minWidth: 0, flex: 1 }}>
																										<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
																											<div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
																												<div style={{ fontWeight: 800, minWidth: 0, wordBreak: 'break-word' }}>{o.name}</div>
																												{showObjectiveDifficultyText ? (
																													<span style={{ fontSize: 12, opacity: 0.9, whiteSpace: 'nowrap' }}>{objectiveDifficultyText}</span>
																												) : null}
																												{showObjectiveDescriptionWarning ? (
																													<span
																														className="saga-warning"
																															title={objectiveDescWarningText}
																															aria-label={objectiveDescWarningText}
																															onPointerDown={(e) => e.stopPropagation()}
																															onClick={(e) => e.stopPropagation()}
																														>
																															<FaExclamationTriangle size={16} />
																														</span>
																													) : null}
																												{showObjectiveDetailedWarning ? (
																													<span
																														className="saga-warning"
																														title={objectiveDetailedWarningText}
																														aria-label={objectiveDetailedWarningText}
																														onPointerDown={(e) => e.stopPropagation()}
																														onClick={(e) => e.stopPropagation()}
																													>
																														<FaExclamationTriangle size={16} />
																													</span>
																													) : null}
																											</div>
																											<div
																												className="objective-actions"
																												style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
																												onPointerDown={(e) => e.stopPropagation()}
																											>
																												<button
																													className="icon option"
																													title="Editar"
																													type="button"
																													onPointerDown={(e) => e.stopPropagation()}
																													onClick={(e) => {
																														e.stopPropagation();
																														setObjectiveEventId(ev.id);
																														setObjectiveInitial(o);
																														setObjectiveModalOpen(true);
																												}}
																											>
																												<FaEdit size={14} />
																											</button>
																											<button
																												className="icon option"
																												title="Eliminar"
																												type="button"
																												onPointerDown={(e) => e.stopPropagation()}
																												onClick={(e) => {
																													e.stopPropagation();
																													setPendingDeleteObjective(o);
																													setConfirmObjectiveOpen(true);
																											}}
																											>
																												<FaTrash size={14} />
																											</button>
																										</div>
																									</div>

																							{expandedObjectiveId === o.id ? (
																										<div style={{ marginTop: 6, opacity: 0.92, fontSize: 13 }}>
																											{o.description ? <div style={{ whiteSpace: 'pre-wrap' }}>{o.description}</div> : null}
																											{o.detailedDescription ? (
																												<div style={{ marginTop: o.description ? 6 : 0, whiteSpace: 'pre-wrap', opacity: 0.95 }}>{o.detailedDescription}</div>
																											) : null}
																											{(Number(o.initialValue || 0) !== 0 || Number(o.difficultyIncrement || 0) !== 0) ? (
																												<div style={{ marginTop: 6, opacity: 0.9 }}>
																													{Number(o.initialValue || 0) !== 0 ? `Valor inicial: ${Number(o.initialValue)}. ` : ''}
																													{Number(o.difficultyIncrement || 0) !== 0 ? `Aumento dificultad: ${Number(o.difficultyIncrement)}.` : ''}
																												</div>
																											) : null}
																											<div style={{ marginTop: 6, opacity: 0.9 }}>Mecánica: {mechanicName || '(sin mecánica)'}</div>
																										</div>
																									) : null}
																								</div>
																							</div>
																						</SortableObjectiveRow>
																					);
																				})}
																			</SortableContext>
																		</div>
																	</ObjectiveListDropZone>
																</div>
															) : null}
														</div>

														<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
															<div className="event-actions" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }} onPointerDown={(e) => e.stopPropagation()}>
																{isMission ? (
																		<button
																			className="icon option"
																			title="Nuevo Objetivo"
																			type="button"
																			onPointerDown={(e) => e.stopPropagation()}
																			onClick={() => {
																				setObjectiveEventId(ev.id);
																				setObjectiveInitial(undefined);
																				setObjectiveModalOpen(true);
																			}}
																		>
																			<FaPlus size={14} />
																		</button>
																	) : null}
																	<button
																		className="icon option"
																		title="Editar"
																		type="button"
																	onPointerDown={(e) => e.stopPropagation()}
																		onClick={() => {
																			setInitial(ev);
																			setModalOpen(true);
																		}}
																	>
																		<FaEdit size={14} />
																	</button>
																	<button
																		className="icon option"
																		title="Eliminar"
																		type="button"
																	onPointerDown={(e) => e.stopPropagation()}
																		onClick={() => {
																			setPendingDelete(ev);
																			setConfirmOpen(true);
																		}}
																	>
																		<FaTrash size={14} />
																	</button>
																	{url ? (
																	<a className="icon option" title="Abrir link" href={url} target="_blank" rel="noopener noreferrer" onPointerDown={(e) => e.stopPropagation()}>
																			<FaDownload size={14} />
																		</a>
																	) : null}
																</div>

															{showMapWarning ? (
																<div style={{ minWidth: 120, textAlign: 'right' }}>
																	<span
																		className="saga-warning"
																		title={mapWarningText}
																		aria-label={mapWarningText}
																		onPointerDown={(e) => e.stopPropagation()}
																		onClick={(e) => e.stopPropagation()}
																	>
																		<FaExclamationTriangle size={16} />
																	</span>
																</div>
															) : showMapBlock && String(mapName || '').trim() ? (
																<div style={{ minWidth: 160, maxWidth: 260, textAlign: 'right', opacity: 0.95, wordBreak: 'break-word' }} title={mapName}>
																	<div>{mapName}</div>
																	{mapImageUrl ? (
																		<img
																			src={mapImageUrl}
																			alt={mapName}
																			style={{ marginTop: 6, width: 220, maxWidth: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 6 }}
																		/>
																	) : null}
																</div>
															) : null}
														</div>
													</div>
												</div>
											);

											return dndEnabled ? (
												<SortableEventCard key={ev.id} event={ev} enabled={true}>
													{(handleProps) => renderCard(handleProps)}
												</SortableEventCard>
											) : (
												<div key={ev.id}>{renderCard(null)}</div>
											);
										})}
									</div>
								</SortableContext>
								<DragOverlay>
									{activeObjective ? (
										<div style={{ maxWidth: 720 }}>
											<div className="objective-row" style={{ cursor: 'grabbing', opacity: 0.95 }}>
												<div className="objective-stripe" aria-hidden="true" />
												<div className="objective-toggle" aria-hidden="true">▸</div>
												<div style={{ minWidth: 0, flex: 1 }}>
													<div style={{ fontWeight: 800, minWidth: 0, wordBreak: 'break-word' }}>{activeObjective.name}</div>
													{activeObjective.description ? (
														<div style={{ marginTop: 4, opacity: 0.9, fontSize: 13, whiteSpace: 'pre-wrap' }}>{activeObjective.description}</div>
													) : null}
												</div>
											</div>
										</div>
									) : null}
								</DragOverlay>
							</DndContext>
					)}
				</div>

			{modalOpen ? (
				<EventModal
					open={modalOpen}
					initial={initial}
					maps={maps}
					onClose={() => {
						setModalOpen(false);
						setInitial(undefined);
					}}
					onSubmit={async (data) => {
						if (initial?.id) {
							await updateEvent(initial.id as number, { ...data });
						} else {
							await createEvent({ ...data, chapterId } as any);
						}
						await refresh();
						setModalOpen(false);
						setInitial(undefined);
					}}
				/>
			) : null}

			{objectiveModalOpen && objectiveEventId !== null ? (
				<ObjectiveModal
					open={objectiveModalOpen}
					eventId={objectiveEventId}
					mechanics={mechanics}
					initial={objectiveInitial}
					onClose={() => {
						setObjectiveModalOpen(false);
						setObjectiveInitial(undefined);
						setObjectiveEventId(null);
					}}
					onSubmit={async (data) => {
						if (objectiveEventId === null) return;
						if (objectiveInitial?.id) {
							await updateObjective(objectiveInitial.id as number, { ...data });
						} else {
							await createObjective({ ...data, eventId: objectiveEventId } as any);
						}
						await refreshObjectives();
						setObjectiveModalOpen(false);
						setObjectiveInitial(undefined);
						setObjectiveEventId(null);
					}}
				/>
			) : null}

			{chapterModalOpen && chapter ? (
				<ChapterModal
					open={chapterModalOpen}
					campaignId={chapter.campaignId}
					initial={chapter}
					onClose={() => setChapterModalOpen(false)}
					onSubmit={async (formData) => {
						await updateChapter(chapter.id, formData);
						const next = await getChapter(chapterId);
						setChapter(next);
						setChapterModalOpen(false);
					}}
				/>
			) : null}

			<ConfirmModal
				open={confirmChapterOpen}
				message={
					<span>
						¿Estás seguro de que deseas eliminar este capítulo?
					</span>
				}
				onConfirm={async () => {
					if (!chapter) return;
					setConfirmChapterOpen(false);
					await deleteChapter(chapter.id);
					onBack();
				}}
				onCancel={() => setConfirmChapterOpen(false)}
			/>

			<ConfirmModal
				open={confirmOpen}
				message={'¿Estás seguro de que deseas eliminar este evento?'}
				onConfirm={async () => {
					const target = pendingDelete;
					setConfirmOpen(false);
					setPendingDelete(null);
					if (!target) return;
					await deleteEvent(target.id);
					await refresh();
				}}
				onCancel={() => {
					setConfirmOpen(false);
					setPendingDelete(null);
				}}
			/>

			<ConfirmModal
				open={confirmObjectiveOpen}
				message={'¿Estás seguro de que deseas eliminar este objetivo?'}
				onConfirm={async () => {
					const target = pendingDeleteObjective;
					setConfirmObjectiveOpen(false);
					setPendingDeleteObjective(null);
					if (!target) return;
					await deleteObjective(target.id);
					await refreshObjectives();
				}}
				onCancel={() => {
					setConfirmObjectiveOpen(false);
					setPendingDeleteObjective(null);
				}}
			/>
		</div>
	);
};

export default ChapterEventsView;

