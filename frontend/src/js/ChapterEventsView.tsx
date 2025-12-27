import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaArrowLeft, FaDownload, FaEdit, FaExclamation, FaExclamationTriangle, FaFilm, FaLock, FaLockOpen, FaPlus, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import ChapterModal from '../components/ChapterModal';
import EventModal from '../components/EventModal';
import { Chapter } from '../interfaces/chapter';
import { EventItem } from '../interfaces/event';
import { MapItem } from '../interfaces/map';
import { deleteChapter, getChapter, updateChapter } from './chapterApi';
import { getMaps } from './mapApi';
import { createEvent, deleteEvent, getEvents, updateEvent } from './eventApi';

interface Props {
	chapterId: number;
	onBack: () => void;
}

interface SortableEventCardProps {
	event: EventItem;
	enabled: boolean;
	children: React.ReactNode;
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
	const [events, setEvents] = useState<EventItem[]>([]);
	const [search, setSearch] = useState('');
	const [eventsDndEnabled, setEventsDndEnabled] = useState(false);
	const [filterEasy, setFilterEasy] = useState(true);
	const [filterNormal, setFilterNormal] = useState(true);
	const [filterHard, setFilterHard] = useState(true);

	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<EventItem> | undefined>(undefined);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<EventItem | null>(null);

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

	const refresh = useCallback(async () => {
		const list = await getEvents({ chapterId });
		setEvents(list || []);
	}, [chapterId]);

	useEffect(() => {
		refresh().catch((e) => console.error('Error cargando eventos', e));
	}, [refresh]);

	const ordered = useMemo(() => {
		return (events || [])
			.slice()
			.sort((a, b) => (Number(a.position ?? 0) - Number(b.position ?? 0)) || (a.id - b.id));
	}, [events]);

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

		return ordered.filter((ev) => passesDifficulty(ev) && matchesText(ev));
	}, [ordered, search, filterEasy, filterNormal, filterHard]);

	const toLabelDifficulty = (d: string) => (d === 'EASY' ? 'Fácil' : d === 'HARD' ? 'Difícil' : 'Normal');

	return (
		<div className="panel panel-corners-soft block-border block-panel-border">
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

				<button
					className="icon"
					aria-label="Nuevo Evento"
					title="Nuevo Evento"
					onClick={() => {
						setInitial(undefined);
						setModalOpen(true);
					}}
				>
					<FaPlus size={20} color="#FFD700" />
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
			{search.trim() ? (
				<div style={{ marginTop: -8, marginBottom: 16, opacity: 0.9, fontSize: 13, padding: '0 12px' }}>
					Resultados: {filtered.length}
				</div>
			) : null}

			<div style={{ padding: 12 }}>
				{filtered.length === 0 ? (
					<div style={{ opacity: 0.8, color: '#e2d9b7' }}>No hay eventos todavía.</div>
				) : (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={async (event) => {
							if (!eventsDndEnabled) return;
							if (isFilteringActive) return;
							const { active, over } = event;
							if (!over) return;
							if (active.id === over.id) return;

							const activeId = String(active.id);
							const overId = String(over.id);
							if (!activeId.startsWith('event:') || !overId.startsWith('event:')) return;

							const activeEventId = Number(activeId.replace('event:', ''));
							const overEventId = Number(overId.replace('event:', ''));
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
						<SortableContext
							items={filtered.map((ev) => `event:${ev.id}`)}
							strategy={verticalListSortingStrategy}
						>
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
										const icon = isMission
											? <FaExclamation size={16} color="#FFD700" />
											: <FaFilm size={16} color="#FFD700" />;
										const showDifficultyText = isMission && (ev.difficulty === 'NORMAL' || ev.difficulty === 'HARD');
										const difficultyText = showDifficultyText ? toLabelDifficulty(String(ev.difficulty)) : '';
										const showDescriptionWarning = !String(ev.description ?? '').trim();
										const descriptionWarningText = 'Este evento no tiene descripción.';
									const card = (
										<div className="block-border block-border-soft" style={{ padding: 12, position: 'relative' }}>
											<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
												<div style={{ minWidth: 0 }}>
														<div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
														<span style={{ display: 'inline-flex', alignItems: 'center' }}>
															{icon}
														</span>
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
												</div>
													<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
														<div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
															<button
																className="icon option"
																title="Editar"
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
																onClick={() => {
																	setPendingDelete(ev);
																	setConfirmOpen(true);
																}}
															>
																<FaTrash size={14} />
															</button>
															{url ? (
																<a className="icon option" title="Abrir link" href={url} target="_blank" rel="noopener noreferrer">
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
									return eventsDndEnabled && !isFilteringActive ? (
										<SortableEventCard key={ev.id} event={ev} enabled={true}>
											{card}
										</SortableEventCard>
									) : (
										<div key={ev.id}>{card}</div>
									);
								})}
							</div>
						</SortableContext>
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
		</div>
	);
};

export default ChapterEventsView;

