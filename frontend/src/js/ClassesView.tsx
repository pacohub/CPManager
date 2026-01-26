import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaTrash, FaTimes, FaRunning, FaPlus } from 'react-icons/fa';
import { FaEdit } from 'react-icons/fa';
import { MdAccountTree } from 'react-icons/md';
import { GiCrossedSwords } from 'react-icons/gi';
import ConfirmModal from '../components/ConfirmModal';
import ClassModal from '../components/ClassModal';
import AnimationModal from '../components/AnimationModal';
import TalentTreeModal from '../components/TalentTreeModal';
import CpImage from '../components/CpImage';
import ClearableSearchInput from '../components/ClearableSearchInput';
import { AnimationItem } from '../interfaces/animation';
import { ClassItem } from '../interfaces/class';
import { getAnimations, createAnimation } from './animationApi';
import { getTalentTrees, createTalentTree, updateTalentTree } from './talentTreeApi';
import { getTalents, createTalent, updateTalent } from './talentApi';
import { getSkills } from './skillApi';
import TalentModal from '../components/TalentModal';
import PortalTooltip from '../components/PortalTooltip';
import { createClass, deleteClass, getClasses, getClass, updateClass, uploadClassIcon } from './classApi';

function asImageUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

interface Props {
	onBack: () => void;
}

const ClassesView: React.FC<Props> = ({ onBack }) => {
	const [classes, setClasses] = useState<ClassItem[]>([]);
	const [animations, setAnimations] = useState<AnimationItem[]>([]);
	const [search, setSearch] = useState('');
	const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
	const [editingTree, setEditingTree] = useState<any | null>(null);

	const [assocAddOpen, setAssocAddOpen] = useState(false);
	const [assocRemoveOpen, setAssocRemoveOpen] = useState(false);
	const [assocToRemove, setAssocToRemove] = useState<AnimationItem | null>(null);
	const [assocSelectedId, setAssocSelectedId] = useState<number | null>(null);
	const [animationCreateOpen, setAnimationCreateOpen] = useState(false);

	const [treeAssocAddOpen, setTreeAssocAddOpen] = useState(false);
	const [treeAssocRemoveOpen, setTreeAssocRemoveOpen] = useState(false);
	const [treeAssocToRemove, setTreeAssocToRemove] = useState<any | null>(null);
	const [treeAssocSelectedId, setTreeAssocSelectedId] = useState<number | null>(null);
	const [talentTrees, setTalentTrees] = useState<any[]>([]);
	const [allTalents, setAllTalents] = useState<any[]>([]);
	const [skills, setSkills] = useState<any[]>([]);
	const [bindOpen, setBindOpen] = useState(false);
	const [bindTarget, setBindTarget] = useState<{ tree?: any; row: number; col: number } | null>(null);
	const [bindSelectedTalent, setBindSelectedTalent] = useState<number | null>(null);
	const [talentCreateOpen, setTalentCreateOpen] = useState(false);
	const [talentTreeCreateOpen, setTalentTreeCreateOpen] = useState(false);
	const [editingTalent, setEditingTalent] = useState<any | null>(null);
	const [hoverTooltip, setHoverTooltip] = useState<{ x: number; y: number; title: string; desc?: string } | null>(null);
	const cardRefs = React.useRef(new Map<number, HTMLDivElement>());

	// links state per tree: map of pairKey -> 'A->B' | 'B->A'
	const [talentLinks, setTalentLinks] = useState<Record<number, Record<string, 'A->B' | 'B->A'>>>({});

	function normalizePair(a: { x: number; y: number }, b: { x: number; y: number }) {
		// return ordered key and flag whether original a is first
		if (a.y < b.y || (a.y === b.y && a.x <= b.x)) {
			return { key: `${a.x},${a.y}:${b.x},${b.y}`, aIsFirst: true };
		}
		return { key: `${b.x},${b.y}:${a.x},${a.y}`, aIsFirst: false };
	}

	const toggleLink = (treeId: number, a: { x: number; y: number }, b: { x: number; y: number }) => {
		const { key } = normalizePair(a, b);
		setTalentLinks((prev) => {
			const copy = { ...(prev || {}) } as Record<number, Record<string, 'A->B' | 'B->A'>>;
			const map = { ...(copy[treeId] || {}) } as Record<string, 'A->B' | 'B->A'>;
			const cur = map[key];
			if (!cur) map[key] = 'A->B';
			else if (cur === 'A->B') map[key] = 'B->A';
			else delete map[key];
			copy[treeId] = map;
			return copy;
		});
	};

	const getLinksForTree = (treeId: number) => {
		const map = (talentLinks || {})[treeId] || {};
		const out: Array<{ fromX: number; fromY: number; toX: number; toY: number }> = [];
		for (const k of Object.keys(map)) {
			const val = map[k];
			const parts = k.split(':');
			if (parts.length !== 2) continue;
			const [a, b] = parts;
			const [ax, ay] = a.split(',').map((v) => Number(v));
			const [bx, by] = b.split(',').map((v) => Number(v));
			if (val === 'A->B') out.push({ fromX: ax, fromY: ay, toX: bx, toY: by });
			else if (val === 'B->A') out.push({ fromX: bx, fromY: by, toX: ax, toY: ay });
		}
		return out;
	};

	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<ClassItem> | undefined>(undefined);

	const [classEditOpen, setClassEditOpen] = useState(false);
	const [confirmDeleteClassOpen, setConfirmDeleteClassOpen] = useState(false);
	const [hoveredClassId, setHoveredClassId] = useState<number | null>(null);
	const [classToEdit, setClassToEdit] = useState<ClassItem | null>(null);
	const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<ClassItem | null>(null);

	const refresh = useCallback(async () => {
		const [list, anims, trees] = await Promise.all([
			getClasses(),
			getAnimations().catch(() => [] as AnimationItem[]),
			getTalentTrees().catch(() => []),
		]);
		setClasses(list || []);
		setAnimations(anims || []);
		setTalentTrees(trees || []);
		// populate talentLinks state from persisted links
		const linksMap: Record<number, Record<string, 'A->B' | 'B->A'>> = {};
		((trees || []) as any[]).forEach((t) => {
			if (!t || !Array.isArray(t.links)) return;
			const map: Record<string, 'A->B' | 'B->A'> = {};
			for (const l of t.links) {
				const a = { x: Number(l.fromX), y: Number(l.fromY) };
				const b = { x: Number(l.toX), y: Number(l.toY) };
				const { key, aIsFirst } = normalizePair(a, b);
				map[key] = aIsFirst ? 'A->B' : 'B->A';
			}
			linksMap[t.id] = map;
		});
		setTalentLinks(linksMap);
	}, []);

	useEffect(() => {
		refresh().catch((e) => console.error('Error cargando clases', e));
		getTalents().then((t) => setAllTalents(t || [])).catch(() => setAllTalents([]));
		getSkills().then((s) => setSkills((s as any[]) || [])).catch(() => setSkills([]));
	}, [refresh]);

	// Drag & drop handlers for moving/swapping talents within a talent tree
	const handleDragStart = (e: React.DragEvent, tree: any, entry: any) => {
		e.dataTransfer.setData('application/json', JSON.stringify({ treeId: tree.id, posX: Number(entry.posX), posY: Number(entry.posY), talentId: Number(entry.talentId) }));
		e.dataTransfer.effectAllowed = 'move';
	};

	const handleDropOnCell = async (e: React.DragEvent, tree: any, targetX: number, targetY: number) => {
		e.preventDefault();
		const raw = e.dataTransfer.getData('application/json');
		if (!raw) return;
		let src: any = null;
		try { src = JSON.parse(raw); } catch { return; }
		if (!src) return;
		// only allow moves within the same tree for now
		if (Number(src.treeId) !== Number(tree.id)) return;

		const entries = (tree.entries || []).map((en: any) => ({ talentId: Number(en.talentId), posX: Number(en.posX), posY: Number(en.posY), order: Number(en.order) || 0 }));

		const srcIndex = entries.findIndex((ee: any) => ee.posX === Number(src.posX) && ee.posY === Number(src.posY) && ee.talentId === Number(src.talentId));
		const tgtIndex = entries.findIndex((ee: any) => ee.posX === Number(targetX) && ee.posY === Number(targetY));

		let newEntries: any[] = [];
		if (srcIndex === -1) return; // nothing to move
		if (tgtIndex >= 0) {
			// swap positions: move src to target pos and target to src pos
			newEntries = entries.slice();
			const srcEntry = { ...newEntries[srcIndex], posX: Number(targetX), posY: Number(targetY) };
			const tgtEntry = { ...newEntries[tgtIndex], posX: Number(src.posX), posY: Number(src.posY) };
			newEntries[srcIndex] = srcEntry;
			newEntries[tgtIndex] = tgtEntry;
		} else {
			// move src to empty target: remove src entry and add new entry at target
			newEntries = entries.filter((_: any, i: number) => i !== srcIndex).concat([{ talentId: Number(src.talentId), posX: Number(targetX), posY: Number(targetY), order: 0 }]);
		}

		try {
				const updated = await updateTalentTree(tree.id, { entries: newEntries, links: getLinksForTree(tree.id) } as any);
			if (updated) {
				setTalentTrees((prev) => (prev || []).map((p: any) => (p.id === updated.id ? updated : p)));
				setSelectedClass((prev) => {
					if (!prev) return prev;
					return { ...prev, talentTrees: (prev.talentTrees || []).map((tt: any) => (tt.id === updated.id ? updated : tt)) } as ClassItem;
				});
			}
		} catch (err) {
			console.error('Error moving talent', err);
		}
	};

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const list = q
			? (classes || []).filter((c) => (c.name || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q))
			: (classes || []);
		return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [classes, search]);

	const orderedAnimations = useMemo(() => {
		return (animations || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [animations]);

	// helpers for associating/removing animations and talent trees
	const addAnimationToClass = useCallback(async (cls: ClassItem, animationId: number) => {
		const existing = (cls.animations || []).map((a: any) => a.id).filter(Boolean) as number[];
		if (existing.includes(animationId)) return;
		await updateClass(cls.id, { animationIds: [...existing, animationId] });
		await refresh();
		const updated = await getClass(cls.id).catch(() => null);
		setSelectedClass(updated);
	}, [refresh]);

	const removeAnimationFromClass = useCallback(async (cls: ClassItem, animationId: number) => {
		const existing = (cls.animations || []).map((a: any) => a.id).filter(Boolean) as number[];
		await updateClass(cls.id, { animationIds: existing.filter((id) => id !== animationId) });
		await refresh();
		const updated = await getClass(cls.id).catch(() => null);
		setSelectedClass(updated);
	}, [refresh]);

	const addTalentTreeToClass = useCallback(async (cls: ClassItem, treeId: number) => {
		const existing = (cls.talentTrees || []).map((t: any) => t.id).filter(Boolean) as number[];
		if (existing.includes(treeId)) return;
		await updateClass(cls.id, { talentTreeIds: [...existing, treeId] });
		await refresh();
		const updated = await getClass(cls.id).catch(() => null);
		setSelectedClass(updated);
	}, [refresh]);

	const removeTalentTreeFromClass = useCallback(async (cls: ClassItem, treeId: number) => {
		const existing = (cls.talentTrees || []).map((t: any) => t.id).filter(Boolean) as number[];
		await updateClass(cls.id, { talentTreeIds: existing.filter((id) => id !== treeId) });
		await refresh();
		const updated = await getClass(cls.id).catch(() => null);
		setSelectedClass(updated);
	}, [refresh]);

	if (selectedClass) {
		const c = selectedClass;
		const iconUrl = asImageUrl(c.icon);
		return (
			<div className="panel panel-corners-soft block-border block-panel-border">
				<div className="panel-header" style={{ position: 'relative' }}>
					<button className="icon" onClick={() => setSelectedClass(null)} title="Volver" aria-label="Volver">
						<FaArrowLeft size={22} color="#FFD700" />
					</button>
					<div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: 'calc(100% - 160px)', padding: '6px 80px 8px 80px', minWidth: 0 }}>
						<div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.1 }}>Clase</div>
						<div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>{(c.name || '').trim() || '—'}</div>
					</div>
					<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
						<button className="icon" title="Editar" aria-label="Editar" onClick={() => { setClassToEdit(c); setClassEditOpen(true); }} disabled={!c}>
							<FaEdit size={18} style={{ color: 'currentColor' }} />
						</button>
						<button className="icon" title="Eliminar" aria-label="Eliminar" onClick={() => { setClassToDelete(c); setConfirmDeleteClassOpen(true); }} disabled={!c}>
							<FaTrash size={18} style={{ color: 'currentColor' }} />
						</button>
					</div>
				</div>

				<div style={{ padding: 12 }}>
					<div className="block-border block-border-soft" style={{ padding: 12 }}>
						<div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
							<CpImage src={iconUrl} width={96} height={96} fit="cover" />
							<div style={{ flex: '1 1 320px', minWidth: 260 }}>
								<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
									<div>
										<div className="chapter-label">Descripción</div>
										<div style={{ whiteSpace: 'pre-wrap', opacity: 0.95 }}>{(c.description || '').trim() ? c.description : '-'}</div>
									</div>
									<div>
										<div className="chapter-label">Nivel</div>
										<div>{Number.isFinite(c.level as any) ? Number(c.level) : 1}</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
						<div className="block-border block-border-soft" style={{ padding: 12, flex: '1 1 360px' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
								<div style={{ fontWeight: 900 }}>Animaciones</div>
								<div style={{ display: 'flex', gap: 8 }}>
									<button className="icon option" title="Asociar animación" onClick={() => { setAssocSelectedId(null); setAssocAddOpen(true); }}>
										<FaRunning size={16} color="#e2d9b7" />
									</button>
								</div>
							</div>

							<div style={{ marginTop: 10 }}>
								{(c.animations || []).length === 0 ? (
									<div style={{ marginTop: 8, opacity: 0.85, fontSize: 13 }}>No hay animaciones asociadas.</div>
								) : (
									<div className="assoc-animations" style={{ display: 'grid', gap: 8 }}>
										{(c.animations || []).map((a: any) => (
											<div key={a.id} className="assoc-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
												<div className="assoc-name">{a.name}</div>
												<div className="assoc-actions">
													<button className="icon option" onClick={async () => { setAssocToRemove(a); setAssocRemoveOpen(true); }} title="Quitar asociación">
														<FaTrash size={14} />
													</button>
												</div>
											</div>
										))}
									</div>
								)}
							</div>

							{assocAddOpen && (
								<div className="modal-overlay">
									<div className="modal-content" style={{ maxWidth: 520 }}>
										<button className="icon option" onClick={() => setAssocAddOpen(false)} style={{ position: 'absolute', top: 12, right: 12 }}><FaTimes /></button>
										<h3>Asociar animación</h3>
										<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
											<select value={assocSelectedId ?? ''} onChange={(e) => setAssocSelectedId(e.target.value ? Number(e.target.value) : null)} style={{ flex: 1 }}>
												<option value="">-- Seleccionar animación --</option>
												{orderedAnimations.filter((a) => !((c.animations || []).some((x: any) => x.id === a.id))).map((a) => (
													<option key={a.id} value={a.id}>{a.name}</option>
												))}
											</select>
											<button className="icon option" title="Crear animación" onClick={() => setAnimationCreateOpen(true)} style={{ flex: '0 0 auto' }}>
												<FaRunning size={16} color="#e2d9b7" />
											</button>
										</div>
										<div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
											<button className="confirm" onClick={async () => { if (!assocSelectedId) return; await addAnimationToClass(c, assocSelectedId); setAssocAddOpen(false); setAssocSelectedId(null); }}>Confirmar</button>
											<button className="cancel" onClick={() => { setAssocAddOpen(false); setAssocSelectedId(null); }}>Cancelar</button>
										</div>
									</div>
								</div>
							)}

							{assocRemoveOpen && (
								<ConfirmModal open={assocRemoveOpen} requireText={undefined} message={assocToRemove ? `¿Quitar la animación "${assocToRemove.name}" de la clase?` : '¿Quitar la animación?'} onConfirm={async () => { if (!assocToRemove) { setAssocRemoveOpen(false); return; } await removeAnimationFromClass(c, assocToRemove.id); setAssocToRemove(null); setAssocRemoveOpen(false); }} onCancel={() => { setAssocToRemove(null); setAssocRemoveOpen(false); }} />
							)}

							{animationCreateOpen && (
								<AnimationModal open={animationCreateOpen} existing={orderedAnimations} onClose={() => setAnimationCreateOpen(false)} onSubmit={async (data) => {
									try {
										const created = await createAnimation({ name: data.name });
										setAnimations((prev) => (prev || []).concat(created));
										setAssocSelectedId(created.id);
										setAnimationCreateOpen(false);
									} catch (e) { console.error(e); }
								}} />
							)}
						</div>

						<div className="block-border block-border-soft" style={{ padding: 12, flex: '1 1 360px' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
								<div style={{ fontWeight: 900 }}>Árboles de Talentos</div>
								<div style={{ display: 'flex', gap: 8 }}>
									<button className="icon option" title="Asociar árbol" onClick={() => { setTreeAssocSelectedId(null); setTreeAssocAddOpen(true); }}>
										<MdAccountTree size={16} color="currentColor" />
									</button>
								</div>
							</div>

							<div style={{ marginTop: 10 }}>
								{(c.talentTrees || []).length === 0 ? (
									<div style={{ marginTop: 8, opacity: 0.85, fontSize: 13 }}>No hay árboles asociados.</div>
								) : (
									<div style={{ display: 'grid', gap: 8 }}>
												{(c.talentTrees || []).map((t: any) => {
													const entries = (t.entries || []) as any[];
													// compute the highest occupied row (posY) and add one empty row below it
													const maxPos = entries.length ? entries.reduce((m: number, e: any) => Math.max(m, Number(e.posY) || 0), -1) : -1;
													const rows = Math.max(2, maxPos + 2); // ensure at least 2 rows (top + empty)
													return (
														<div
															key={t.id}
															className="campaign-card metallic-border"
															style={{ position: 'relative', display: 'block', padding: 10, cursor: 'default', backgroundImage: t.file ? `url("${asImageUrl(t.file)}")` : undefined }}
															tabIndex={0}
															aria-label={t.name}
														>
															<div className="campaign-actions">
																<button
																	className="icon option"
																	title="Editar"
																	aria-label="Editar"
																	onClick={(e) => { e.stopPropagation(); setEditingTree(t); }}
																	onPointerDown={(e) => e.stopPropagation()}
																	tabIndex={-1}
																>
																	<FaEdit size={14} />
																</button>
																<button
																	className="icon option"
																	title="Quitar asociación"
																	aria-label="Quitar asociación"
																	onClick={(e) => { e.stopPropagation(); setTreeAssocToRemove(t); setTreeAssocRemoveOpen(true); }}
																	onPointerDown={(e) => e.stopPropagation()}
																	tabIndex={-1}
																>
																	<FaTrash size={14} />
																</button>
															</div>

															<div className="campaign-title" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
																<div style={{ fontWeight: 800, minWidth: 0, wordBreak: 'break-word' }}>{(t.name || '').trim() || '\u2014'}</div>
															</div>

																<div ref={(el) => { if (el) cardRefs.current.set(t.id, el); else cardRefs.current.delete(t.id); }} style={{ paddingTop: 40 }}>
																{/* grid of rows, 4 cols each */}
																{Array.from({ length: rows }).map((_, rowIndex) => (
																		<div key={rowIndex} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
																		{Array.from({ length: 4 }).map((__, colIndex) => {
																			const found = entries.find((e) => Number(e.posX) === colIndex && Number(e.posY) === rowIndex);

																			// prepare cell content
																			let cellContent: React.ReactNode = <div style={{ fontSize: 18, color: '#ddd' }}>+</div>;
																			if (found) {
																				const talentObj = found.talent || (allTalents || []).find((ta) => Number(ta.id) === Number(found.talentId));
																				const iconSrc = asImageUrl(talentObj?.icon || talentObj?.file);
																				if (iconSrc) {
																					cellContent = (
																						<>
																							<div className="talent-icon">
																								<img draggable={true} onDragStart={(e) => handleDragStart(e, t, found)} src={iconSrc} alt={talentObj?.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
																							</div>
																						</>
																					);
																				} else {
																					cellContent = <div className="talent-missing" aria-hidden="true">!</div>;
																				}
																			}

																			return (
																				<div
																					key={colIndex}
																					className={`talent-cell ${found ? 'talent-filled' : 'talent-empty'}`}
																					style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
																					onDragOver={(e) => e.preventDefault()}
																					onDrop={(e) => handleDropOnCell(e, t, colIndex, rowIndex)}
																					onClick={(e) => {
																						e.stopPropagation();
																						if (found) {
																							const talentObj = found.talent || (allTalents || []).find((ta) => Number(ta.id) === Number(found.talentId));
																							setEditingTalent({ talent: talentObj, tree: t, entry: found });
																						} else {
																							setBindTarget({ tree: t, row: rowIndex, col: colIndex });
																							setBindSelectedTalent(found ? found.talent?.id ?? null : null);
																							setBindOpen(true);
																						}
																					}}
																					onMouseEnter={(e) => {
																						if (!found) return;
																						const talentObj = found.talent || (allTalents || []).find((ta) => Number(ta.id) === Number(found.talentId));
																						// anchor: tooltip bottom-left at icon's top-right
																						const iconEl = (e.currentTarget as HTMLElement).querySelector('.talent-icon') as HTMLElement | null;
																						const anchor = iconEl ?? (e.currentTarget as HTMLElement);
																						const rect = anchor.getBoundingClientRect();
																						const x = Math.round(rect.right + window.scrollX);
																						const y = Math.round(rect.top + window.scrollY);
																						setHoverTooltip({ x, y, title: talentObj?.name ?? '?', desc: talentObj?.description ?? undefined });
																					}}
																					onMouseLeave={() => setHoverTooltip(null)}
																				>
																					{cellContent}

																					{/* right gap */}
																					{colIndex < 3 && (
																						<div className="talent-gap horizontal" onClick={(ev) => { ev.stopPropagation(); toggleLink(t.id, { x: colIndex, y: rowIndex }, { x: colIndex + 1, y: rowIndex }); }}>
																						{(() => {
																						const { key, aIsFirst } = normalizePair({ x: colIndex, y: rowIndex }, { x: colIndex + 1, y: rowIndex });
																						const dir = (talentLinks[t.id] || {})[key];
																						if (!dir) return null;
																																												const pointingAtoB = dir === 'A->B';
																																												// resolve actual visual direction depending on normalization
																																												const showRight = (aIsFirst && pointingAtoB) || (!aIsFirst && !pointingAtoB);
																																												return (
																																													<div className={`talent-arrow horizontal`}>
																																														{showRight ? (
																																															<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
																																																<rect x="2" y="9" width="12" height="6" rx="3" fill="#ffd870" stroke="none" />
																																																<polygon points="16,6 22,12 16,18" fill="#ffd870" stroke="none" />
																																															</svg>
																																														) : (
																																															<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
																																																<rect x="10" y="9" width="12" height="6" rx="3" fill="#ffd870" stroke="none" />
																																																<polygon points="8,12 14,6 14,18" fill="#ffd870" stroke="none" />
																																															</svg>
																																														)}
																																													</div>
																																												);
																						})()}
																						</div>
																					)}

																					{/* bottom gap */}
																					{rowIndex < rows - 1 && (
																						<div className="talent-gap vertical" onClick={(ev) => { ev.stopPropagation(); toggleLink(t.id, { x: colIndex, y: rowIndex }, { x: colIndex, y: rowIndex + 1 }); }}>
																						{(() => {
																						const { key, aIsFirst } = normalizePair({ x: colIndex, y: rowIndex }, { x: colIndex, y: rowIndex + 1 });
																						const dir = (talentLinks[t.id] || {})[key];
																						if (!dir) return null;
																																												const pointingAtoB = dir === 'A->B';
																																												const showDown = (aIsFirst && pointingAtoB) || (!aIsFirst && !pointingAtoB);
																																												return (
																																													<div className={`talent-arrow vertical`}>
																																														{showDown ? (
																																															<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
																																																<rect x="9" y="2" width="6" height="12" rx="3" fill="#ffd870" stroke="none" />
																																																<polygon points="6,14 12,20 18,14" fill="#ffd870" stroke="none" />
																																															</svg>
																																														) : (
																																															<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
																																																<rect x="9" y="10" width="6" height="12" rx="3" fill="#ffd870" stroke="none" />
																																																<polygon points="6,10 12,4 18,10" fill="#ffd870" stroke="none" />
																																															</svg>
																																														)}
																																													</div>
																																												);
																						})()}
																						</div>
																					)}
																				</div>
																			);
																		})}
																		{/* render portal tooltip once at component level */}
																		{hoverTooltip && (
																			<PortalTooltip visible={true} x={hoverTooltip.x} y={hoverTooltip.y}>
																				<div className="title">{hoverTooltip.title}</div>
																				{hoverTooltip.desc ? <div className="desc">{hoverTooltip.desc}</div> : null}
																			</PortalTooltip>
																		)}
																	</div>
																))}
															</div>

															{/* card-level tooltip rendered at top-right and full card width */}
															{/* portal tooltip rendered in document.body */}
                                                            
														</div>
													);
												})}
									</div>
								)}
							</div>

							{treeAssocAddOpen && (
								<div className="modal-overlay">
									<div className="modal-content" style={{ maxWidth: 520 }}>
										<button className="icon option" onClick={() => setTreeAssocAddOpen(false)} style={{ position: 'absolute', top: 12, right: 12 }}><FaTimes /></button>
										<h3>Asociar árbol de talentos</h3>
										<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
											<select value={treeAssocSelectedId ?? ''} onChange={(e) => setTreeAssocSelectedId(e.target.value ? Number(e.target.value) : null)} style={{ flex: 1 }}>
												<option value="">-- Seleccionar árbol --</option>
												{(talentTrees || []).filter((t) => !((c.talentTrees || []).some((x: any) => x.id === t.id))).map((t) => (
													<option key={t.id} value={t.id}>{t.name}</option>
												))}
											</select>
											<button className="icon option" title="Crear árbol" onClick={() => setTalentTreeCreateOpen(true)} style={{ flex: '0 0 auto' }}>
												<MdAccountTree size={16} color="currentColor" />
											</button>
										</div>
										<div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
											<button className="confirm" onClick={async () => { if (!treeAssocSelectedId) return; await addTalentTreeToClass(c, treeAssocSelectedId); setTreeAssocAddOpen(false); setTreeAssocSelectedId(null); }}>Confirmar</button>
											<button className="cancel" onClick={() => { setTreeAssocAddOpen(false); setTreeAssocSelectedId(null); }}>Cancelar</button>
										</div>
									</div>
								</div>
							)}

							{treeAssocRemoveOpen && (
								<ConfirmModal open={treeAssocRemoveOpen} requireText={undefined} message={treeAssocToRemove ? `¿Quitar el árbol "${treeAssocToRemove.name}" de la clase?` : '¿Quitar el árbol?'} onConfirm={async () => { if (!treeAssocToRemove) { setTreeAssocRemoveOpen(false); return; } await removeTalentTreeFromClass(c, treeAssocToRemove.id); setTreeAssocToRemove(null); setTreeAssocRemoveOpen(false); }} onCancel={() => { setTreeAssocToRemove(null); setTreeAssocRemoveOpen(false); }} />
							)}

							{/* Removed per-card ConfirmModal; use the single top-level modal instead */}

							{bindOpen && bindTarget && (
								<div className="modal-overlay">
									<div className="modal-content" style={{ maxWidth: 520 }}>
										<button className="icon option" onClick={() => { setBindOpen(false); setBindTarget(null); }} style={{ position: 'absolute', top: 12, right: 12 }}><FaTimes /></button>
										<h3>Vincular talento</h3>
										<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
										<div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}>
											<select value={bindSelectedTalent ?? ''} onChange={(e) => setBindSelectedTalent(e.target.value ? Number(e.target.value) : null)} style={{ flex: 1 }}>
												<option value="">-- Seleccionar talento --</option>
												{(allTalents || []).map((ta) => (
													<option key={ta.id} value={ta.id}>{ta.name}</option>
												))}
											</select>
											<button className="icon option" title="Añadir talento" onClick={() => setTalentCreateOpen(true)}>
												<FaPlus />
											</button>
										</div>
										</div>
										<div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
											<button className="confirm" onClick={async () => {
												if (!bindTarget) return;
												const tree = bindTarget.tree;
												const existing = (tree.entries || []).map((e: any) => ({ talentId: e.talentId, posX: Number(e.posX) || 0, posY: Number(e.posY) || 0, order: Number(e.order) || 0 }));
												// remove any entry in same cell
												const filtered = existing.filter((e: any) => !(e.posX === bindTarget.col && e.posY === bindTarget.row));
												if (bindSelectedTalent) filtered.push({ talentId: bindSelectedTalent, posX: bindTarget.col, posY: bindTarget.row, order: 0 });
												try {
													const updated = await updateTalentTree(tree.id, { entries: filtered, links: getLinksForTree(tree.id) } as any);
													if (updated) {
														setTalentTrees((prev) => (prev || []).map((p: any) => (p.id === updated.id ? updated : p)));
														setSelectedClass((prev) => {
															if (!prev) return prev;
															return { ...prev, talentTrees: (prev.talentTrees || []).map((tt: any) => (tt.id === updated.id ? updated : tt)) } as ClassItem;
														});
													}
												} catch (err) { console.error(err); }
												setBindOpen(false); setBindTarget(null);
											}}>
											Confirmar
											</button>
											<button className="cancel" onClick={() => { setBindOpen(false); setBindTarget(null); }}>Cancelar</button>
										</div>
									</div>
								</div>
							)}

						{talentCreateOpen && (
							<TalentModal open={talentCreateOpen} skills={skills} onClose={() => setTalentCreateOpen(false)} onSubmit={async (data) => {
								try {
									const created = await createTalent(data as any);
									setAllTalents((prev) => (prev || []).concat(created));
									setBindSelectedTalent(created.id);
									setTalentCreateOpen(false);
								} catch (err) { console.error(err); }
							}} />
						)}

						{editingTalent && (
							<TalentModal
								open={!!editingTalent}
								initial={editingTalent.talent}
								skills={skills}
								onClose={() => setEditingTalent(null)}
								onSubmit={async (data) => {
									try {
										const updated = await updateTalent(editingTalent.talent.id, data as any);
										if (updated) {
											setAllTalents((prev) => (prev || []).map((p: any) => (p.id === updated.id ? updated : p)));
											setTalentTrees((prev) => (prev || []).map((tt: any) => (tt.id === tt.id ? tt : tt)));
										}
										setEditingTalent(null);
									} catch (err) { console.error(err); }
								}}
								onDeleteBinding={async () => {
									if (!editingTalent) return;
									const tree = editingTalent.tree;
									const entry = editingTalent.entry;
									const existing = (tree.entries || []).map((e: any) => ({ talentId: e.talentId, posX: Number(e.posX) || 0, posY: Number(e.posY) || 0, order: Number(e.order) || 0 }));
									const filtered = existing.filter((e: any) => !(e.posX === Number(entry.posX) && e.posY === Number(entry.posY) && e.talentId === Number(entry.talentId)));
									const updatedTree = await updateTalentTree(tree.id, { entries: filtered, links: getLinksForTree(tree.id) } as any);
									if (updatedTree) {
										setTalentTrees((prev) => (prev || []).map((p: any) => (p.id === updatedTree.id ? updatedTree : p)));
										setSelectedClass((prev) => {
											if (!prev) return prev;
											return { ...prev, talentTrees: (prev.talentTrees || []).map((tt: any) => (tt.id === updatedTree.id ? updatedTree : tt)) } as ClassItem;
										});
									}
									setEditingTalent(null);
								}}
								onDeleted={async (id: number) => {
									setAllTalents((prev) => (prev || []).filter((t: any) => t.id !== id));
								}}
							/>
						)}

							{talentTreeCreateOpen && (
								<TalentTreeModal open={talentTreeCreateOpen} talents={[]} initial={undefined} onClose={() => setTalentTreeCreateOpen(false)} onSubmit={async (data) => {
									try {
										const created = await createTalentTree(data as any);
										setTalentTrees((prev) => (prev || []).concat(created));
										setTreeAssocSelectedId(created.id);
										setTalentTreeCreateOpen(false);
									} catch (e) { console.error(e); }
								}} />
							)}

							{editingTree && (
								<TalentTreeModal open={!!editingTree} talents={[]} initial={editingTree} onClose={() => setEditingTree(null)} onSubmit={async (data) => {
									try {
										const payload = { ...(data as any), links: getLinksForTree(editingTree.id) };
										const updated = await updateTalentTree(editingTree.id, payload as any);
										if (updated) {
											setTalentTrees((prev) => (prev || []).map((p: any) => (p.id === updated.id ? updated : p)));
											setSelectedClass((prev) => {
												if (!prev) return prev;
												return { ...prev, talentTrees: (prev.talentTrees || []).map((tt: any) => (tt.id === updated.id ? updated : tt)) } as ClassItem;
											});
										}
										setEditingTree(null);
									} catch (e) { console.error(e); }
								}} />
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="panel panel-corners-soft block-border block-panel-border">
			<div className="panel-header" style={{ position: 'relative' }}>
				<button className="icon" onClick={onBack} title="Volver" aria-label="Volver"><FaArrowLeft size={22} color="#FFD700" /></button>
				<div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: 'calc(100% - 160px)', padding: '6px 80px 8px 80px', minWidth: 0 }}>
					<div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.1 }}>Listado</div>
					<div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>Clases</div>
				</div>
				<button className="icon" aria-label="Nueva Clase" title="Nueva Clase" onClick={() => { setInitial(undefined); setModalOpen(true); }}><GiCrossedSwords size={26} color="#FFD700" /></button>
			</div>

			<div className="filters-bar">
				<div className="filters-row">
					<ClearableSearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Buscar clase..." className="filters-input" />
				</div>
			</div>

			{search.trim() ? (<div style={{ marginTop: -8, marginBottom: 16, opacity: 0.9, fontSize: 13, padding: '0 12px' }}>Resultados: {filtered.length}</div>) : null}

			<div style={{ padding: 12 }}>
				{classEditOpen && (classToEdit || selectedClass) ? (
					<ClassModal
						open={classEditOpen}
						initial={(classToEdit || selectedClass) as Partial<ClassItem> | undefined}
						existing={classes}
						onClose={() => { setClassEditOpen(false); setClassToEdit(null); }}
						onSubmit={async (data) => {
							try {
								let iconValue = (data.icon || '').trim();
								if ((data as any).iconFile) {
									try {
										const uploaded = await uploadClassIcon((data as any).iconFile);
										if (uploaded) iconValue = uploaded;
									} catch (err) {
										console.error('Error uploading class icon', err);
										alert((err as any)?.message || 'Error subiendo el icono');
										return;
									}
								} else if ((data as any).removeIcon) {
									iconValue = '';
								}

								const payload: any = {
									name: (data as any).name?.trim(),
									description: (data as any).description,
									level: Number((data as any).level) || 1,
									icon: iconValue || undefined,
								};

								const target = classToEdit || selectedClass;
								if (!target) return;
								await updateClass((target as ClassItem).id, payload);
								const updated = await getClass((target as ClassItem).id).catch(() => null);
								setSelectedClass(updated);
								setClassEditOpen(false);
								setClassToEdit(null);
								await refresh();
							} catch (e) {
								console.error('Error updating class', e);
							}
						}}
					/>
				) : null}
			{classEditOpen && (classToEdit || selectedClass) ? (
				<ClassModal
					open={classEditOpen}
					initial={(classToEdit || selectedClass) as Partial<ClassItem> | undefined}
					existing={classes}
					onClose={() => { setClassEditOpen(false); setClassToEdit(null); }}
					onSubmit={async (data) => {
						try {
							let iconValue = (data.icon || '').trim();
							if ((data as any).iconFile) {
								try {
									const uploaded = await uploadClassIcon((data as any).iconFile);
									if (uploaded) iconValue = uploaded;
								} catch (err) {
									console.error('Error uploading class icon', err);
									alert((err as any)?.message || 'Error subiendo el icono');
									return;
								}
							} else if ((data as any).removeIcon) {
								iconValue = '';
							}

							const payload: any = {
								name: (data as any).name?.trim(),
								description: (data as any).description,
								level: Number((data as any).level) || 1,
								icon: iconValue || undefined,
							};

							const target = classToEdit || selectedClass;
							if (!target) return;
							await updateClass((target as ClassItem).id, payload);
							const updated = await getClass((target as ClassItem).id).catch(() => null);
							setSelectedClass(updated);
							setClassEditOpen(false);
							setClassToEdit(null);
							await refresh();
						} catch (e) {
							console.error('Error updating class', e);
						}
					}}
				/>
			) : null}
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
					{filtered.map((c) => {
						const iconUrl = asImageUrl(c.icon);
						return (
							<div
								key={c.id}
								className="block-border block-border-soft mechanic-card"
								style={{ padding: 12, cursor: 'pointer', position: 'relative' }}
								role="button"
								tabIndex={0}
								onClick={() => setSelectedClass(c)}
								onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedClass(c); }}
								onMouseEnter={() => setHoveredClassId(c.id)}
								onMouseLeave={() => setHoveredClassId(null)}
								title={c.description || undefined}
							>
								<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
									<CpImage src={iconUrl} width={64} height={64} fit="cover" />
									<div style={{ flex: 1 }}>
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
											<div style={{ fontWeight: 800 }}>{(c.name || '').trim() || '—'}</div>
											<div style={{ fontSize: 12, opacity: 0.85 }}>Nivel {Number.isFinite(c.level as any) ? Number(c.level) : 1}</div>
										</div>
										<div className="mechanic-actions" style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 8, opacity: hoveredClassId === c.id ? 1 : 0, pointerEvents: hoveredClassId === c.id ? 'auto' : 'none', transition: 'opacity 0.12s ease-in-out' }}>
											<button className="icon option" title="Editar" onClick={(e) => { e.stopPropagation(); setClassToEdit(c); setClassEditOpen(true); }}>
												<FaEdit size={16} />
											</button>
											<button className="icon option" title="Eliminar" onClick={(e) => { e.stopPropagation(); setClassToDelete(c); setConfirmDeleteClassOpen(true); }}>
												<FaTrash size={16} />
											</button>
										</div>
										<div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, opacity: 0.9 }}>
											<div>Animaciones: {(c.animations || []).length}</div>
											<div>Árboles: {(c.talentTrees || []).length}</div>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{modalOpen ? (<ClassModal open={modalOpen} existing={classes} initial={initial} onClose={() => { setModalOpen(false); setInitial(undefined); }} onSubmit={async (data) => { if ((initial as any)?.id) await updateClass((initial as any).id, data); else await createClass(data); await refresh(); setModalOpen(false); setInitial(undefined); }} />) : null}
			<ConfirmModal open={confirmOpen} requireText="eliminar" message={"¿Estás seguro de que deseas eliminar esta clase?"} onConfirm={async () => { const target = pendingDelete; if (target) { try { await deleteClass(target.id); await refresh(); } catch (e) { console.error('Error eliminando clase', e); } } setPendingDelete(null); setConfirmOpen(false); }} onCancel={() => { setConfirmOpen(false); setPendingDelete(null); }} />

			{/* Single top-level ConfirmModal for class list/header delete actions */}
			<ConfirmModal
				open={confirmDeleteClassOpen}
				requireText="eliminar"
				message={"¿Estás seguro de que deseas eliminar esta clase?"}
				onConfirm={async () => {
					setConfirmDeleteClassOpen(false);
					try {
						const target = classToDelete || selectedClass;
						const targetId = (target as any)?.id as number | undefined;
						if (!targetId) return;
						await deleteClass(targetId);
						if (selectedClass && (selectedClass as any).id === targetId) setSelectedClass(null);
						setClassToDelete(null);
						await refresh();
					} catch (e: any) {
						console.error('Error deleting class', e);
						alert(e?.message || 'No se pudo eliminar la clase');
					}
				}}
				onCancel={() => { setConfirmDeleteClassOpen(false); setClassToDelete(null); }}
			/>

		</div>
	);
};

export default ClassesView;
