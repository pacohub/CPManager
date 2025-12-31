import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa';
import { FaEdit } from 'react-icons/fa';
import { GiChest } from 'react-icons/gi';
import ConfirmModal from '../components/ConfirmModal';
import GameObjectModal from '../components/GameObjectModal';
import IconSelect, { IconSelectItem } from '../components/IconSelect';
import CpImage from '../components/CpImage';
import { GameObjectItem } from '../interfaces/gameObject';
import { ProfessionItem } from '../interfaces/profession';
import { ProfessionObjectLink } from '../interfaces/professionObject';
import { ProfessionObjectResourceLink } from '../interfaces/professionObjectResource';
import { ResourceItem } from '../interfaces/resource';
import { createObject, getObjects, uploadObjectIcon } from './gameObjectApi';
import { getProfession } from './professionApi';
import { getProfessionObjects, replaceProfessionObjects } from './professionObjectApi';
import { getProfessionObjectResourcesByProfession, replaceProfessionObjectResources } from './professionObjectResourceApi';
import { getResources } from './resourceApi';

function normalizeLink(raw: string): string {
	const v = (raw || '').trim();
	if (!v) return '';
	if (/^https?:\/\//i.test(v)) return v;
	return `https://${v}`;
}

function asImageUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

function toInt(v: any, fallback: number): number {
	const n = Number.parseInt(String(v), 10);
	return Number.isFinite(n) ? n : fallback;
}

interface Props {
	professionId: number;
	onBack: () => void;
}

const ProfessionDetail: React.FC<Props> = ({ professionId, onBack }) => {
	const [profession, setProfession] = useState<ProfessionItem | null>(null);
	const [objects, setObjects] = useState<GameObjectItem[]>([]);
	const [resources, setResources] = useState<ResourceItem[]>([]);
	const [links, setLinks] = useState<ProfessionObjectLink[]>([]);
	const [resourcesByObjectId, setResourcesByObjectId] = useState<Record<number, ProfessionObjectResourceLink[]>>({});

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [selectedObjectId, setSelectedObjectId] = useState<number | ''>('');
	const [newLevel, setNewLevel] = useState<number>(1);
	const [newQuantity, setNewQuantity] = useState<number>(1);
	const [newTimeSeconds, setNewTimeSeconds] = useState<number>(0);

	const [editingObjectId, setEditingObjectId] = useState<number | null>(null);
	const [resourcesOpenObjectId, setResourcesOpenObjectId] = useState<number | null>(null);

	const [selectedResourceId, setSelectedResourceId] = useState<number | ''>('');
	const [newResourceQuantity, setNewResourceQuantity] = useState<number>(1);

	const [confirmUnlinkOpen, setConfirmUnlinkOpen] = useState(false);
	const [pendingUnlink, setPendingUnlink] = useState<ProfessionObjectLink | null>(null);

	const [objectModalOpen, setObjectModalOpen] = useState(false);

	const saveLinksTimerRef = useRef<number | null>(null);
	const saveResourcesTimersRef = useRef<Record<number, number | null>>({});
	const lastSavedResourcesRef = useRef<Record<number, string>>({});

	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [p, obj, res, rel, por] = await Promise.all([
				getProfession(professionId),
				getObjects(),
				getResources(),
				getProfessionObjects(professionId),
				getProfessionObjectResourcesByProfession(professionId),
			]);
			setProfession(p);
			setObjects(obj || []);
			setResources(res || []);
			setLinks(rel || []);
			setResourcesByObjectId(por || {});
			lastSavedResourcesRef.current = Object.fromEntries(
				Object.entries(por || {}).map(([k, v]) => [Number(k), JSON.stringify((v || []).slice().sort((a, b) => a.resourceId - b.resourceId))]),
			);
		} catch (e: any) {
			setError(e?.message || 'Error cargando la profesión');
		} finally {
			setLoading(false);
		}
	}, [professionId]);

	useEffect(() => {
		refresh().catch((e) => console.error(e));
	}, [refresh]);

	const objectsById = useMemo(() => new Map((objects || []).map((o) => [o.id, o])), [objects]);
	const resourcesById = useMemo(() => new Map((resources || []).map((r) => [r.id, r])), [resources]);

	const availableObjectItems: IconSelectItem[] = useMemo(() => {
		const linked = new Set((links || []).map((l) => l.objectId));
		return (objects || [])
			.filter((o) => !linked.has(o.id))
			.slice()
			.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }))
			.map((o) => ({ value: o.id, label: o.name || `Objeto #${o.id}`, iconUrl: asImageUrl(o.icon) }));
	}, [objects, links]);

	const availableResourceItems: IconSelectItem[] = useMemo(() => {
		return (resources || [])
			.slice()
			.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }))
			.map((r) => ({ value: r.id, label: r.name || `Recurso #${r.id}`, iconUrl: asImageUrl(r.icon) }));
	}, [resources]);

	useEffect(() => {
		if (loading) return;
		if (saveLinksTimerRef.current) window.clearTimeout(saveLinksTimerRef.current);
		saveLinksTimerRef.current = window.setTimeout(async () => {
			try {
				const payload = (links || []).map((l) => ({
					objectId: l.objectId,
					level: Math.max(1, toInt(l.level, 1)),
					quantity: Math.max(0, toInt(l.quantity, 1)),
					timeSeconds: Math.max(0, toInt(l.timeSeconds, 0)),
				}));
				await replaceProfessionObjects(professionId, payload);
			} catch (e) {
				console.error('Error guardando objetos asociados', e);
			}
		}, 400);
		return () => {
			if (saveLinksTimerRef.current) window.clearTimeout(saveLinksTimerRef.current);
		};
	}, [links, professionId, loading]);

	useEffect(() => {
		if (loading) return;
		const keys = Object.keys(resourcesByObjectId || {}).map((k) => Number(k));
		for (const objectId of keys) {
			const current = (resourcesByObjectId?.[objectId] || []).slice().sort((a, b) => a.resourceId - b.resourceId);
			const serialized = JSON.stringify(current.map((x) => ({ resourceId: x.resourceId, quantity: x.quantity })));
			if (lastSavedResourcesRef.current[objectId] === serialized) continue;

			const prevTimer = saveResourcesTimersRef.current[objectId];
			if (prevTimer) window.clearTimeout(prevTimer);
			saveResourcesTimersRef.current[objectId] = window.setTimeout(async () => {
				try {
					await replaceProfessionObjectResources(
						professionId,
						objectId,
						(current || []).map((x) => ({ resourceId: x.resourceId, quantity: Math.max(0, toInt(x.quantity, 1)) })),
					);
					lastSavedResourcesRef.current[objectId] = serialized;
				} catch (e) {
					console.error('Error guardando recursos del objeto', objectId, e);
				}
			}, 450);
		}
	}, [resourcesByObjectId, professionId, loading]);

	if (loading) {
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
							maxWidth: 'calc(100% - 140px)',
							padding: '6px 70px 8px 70px',
							minWidth: 0,
						}}
					>
						<div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.1 }}>Profesión</div>
						<div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1, minWidth: 0, wordBreak: 'break-word' }}>Cargando...</div>
					</div>
					<div style={{ width: 32 }} />
				</div>
				<div style={{ padding: 12, opacity: 0.9 }}>Cargando...</div>
			</div>
		);
	}

	if (error || !profession) {
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
							maxWidth: 'calc(100% - 140px)',
							padding: '6px 70px 8px 70px',
							minWidth: 0,
						}}
					>
						<div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.1 }}>Profesión</div>
						<div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1, minWidth: 0, wordBreak: 'break-word' }}>—</div>
					</div>
					<div style={{ width: 32 }} />
				</div>
				<div style={{ padding: 12, color: '#e2d9b7', opacity: 0.95 }}>{error || 'No se pudo cargar la profesión.'}</div>
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
						maxWidth: 'calc(100% - 140px)',
						padding: '6px 70px 8px 70px',
						minWidth: 0,
					}}
				>
					<div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.1 }}>Profesión</div>
					<div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1, minWidth: 0, wordBreak: 'break-word' }}>{profession.name || 'Profesión'}</div>
				</div>
				<div style={{ width: 32 }} />
			</div>

			<div style={{ padding: 12 }}>
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 14, alignItems: 'start' }}>
					<div className="block-border block-border-soft" style={{ padding: 12 }}>
						<div style={{ fontWeight: 800, marginBottom: 6 }}>Descripción</div>
						<div style={{ whiteSpace: 'pre-wrap', opacity: 0.95 }}>{(profession.description || '').trim() || '—'}</div>

						<div style={{ height: 10 }} />
						<div style={{ fontWeight: 800, marginBottom: 6 }}>Link</div>
						{(profession.link || '').trim() ? (
							<a
								href={normalizeLink(profession.link || '')}
								target="_blank"
								rel="noreferrer"
								style={{ color: '#e2c044', textDecoration: 'underline', wordBreak: 'break-all', fontSize: 13 }}
							>
								{(profession.link || '').trim()}
							</a>
						) : (
							<div style={{ opacity: 0.9 }}>—</div>
						)}
					</div>

					<div className="block-border block-border-soft" style={{ padding: 12 }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
							<div style={{ fontWeight: 900 }}>Vincular objetos</div>
							<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
								<button className="icon option" title="Nuevo objeto" aria-label="Nuevo objeto" onClick={() => setObjectModalOpen(true)}>
									<GiChest size={18} />
								</button>
								<IconSelect value={selectedObjectId} placeholder="Selecciona un objeto..." items={availableObjectItems} onChange={setSelectedObjectId} />
								<button
									className="icon option"
									title="Vincular"
									aria-label="Vincular"
									disabled={!selectedObjectId}
									onClick={() => {
										if (!selectedObjectId) return;
										const objectId = Number(selectedObjectId);
										setLinks((prev) =>
											(prev || []).concat({
												professionId,
												objectId,
												level: Math.max(1, toInt(newLevel, 1)),
												quantity: Math.max(0, toInt(newQuantity, 1)),
												timeSeconds: Math.max(0, toInt(newTimeSeconds, 0)),
											}),
										);
										setSelectedObjectId('');
									}}
								>
									<FaPlus size={16} />
								</button>
							</div>
						</div>

						<div style={{ marginTop: 10 }}>
							<div style={{ opacity: 0.9, fontSize: 13, marginBottom: 8 }}>Valores por defecto al vincular:</div>
							<div style={{ display: 'grid', gridTemplateColumns: '110px 110px 140px', gap: 8 }}>
								<label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, opacity: 0.9 }}>
									Nivel
									<input type="number" min={1} value={newLevel} onChange={(e) => setNewLevel(toInt(e.target.value, 1))} style={{ padding: 6 }} />
								</label>
								<label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, opacity: 0.9 }}>
									Cantidad
									<input type="number" min={0} value={newQuantity} onChange={(e) => setNewQuantity(toInt(e.target.value, 1))} style={{ padding: 6 }} />
								</label>
								<label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, opacity: 0.9 }}>
									Tiempo (s)
									<input type="number" min={0} value={newTimeSeconds} onChange={(e) => setNewTimeSeconds(toInt(e.target.value, 0))} style={{ padding: 6 }} />
								</label>
							</div>
						</div>
					</div>
				</div>

				<div style={{ marginTop: 14 }} className="block-border block-border-soft">
					<div style={{ padding: 12, fontWeight: 900 }}>Objetos asociados</div>
					<div style={{ padding: '0 12px 12px 12px', overflowX: 'auto' }}>
						<table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
							<thead>
								<tr style={{ textAlign: 'left', fontSize: 13, opacity: 0.95 }}>
									<th style={{ padding: '8px 6px' }}>Objeto</th>
									<th style={{ padding: '8px 6px', width: 140 }}>Nivel</th>
									<th style={{ padding: '8px 6px', width: 140 }}>Cantidad</th>
									<th style={{ padding: '8px 6px', width: 180 }}>Tiempo (s)</th>
									<th style={{ padding: '8px 6px' }}>Recursos</th>
									<th style={{ padding: '8px 6px', width: 120 }} />
								</tr>
							</thead>
							<tbody>
								{(links || []).map((l) => {
									const o = objectsById.get(l.objectId);
									const iconUrl = asImageUrl(o?.icon);
									const isEditing = editingObjectId === l.objectId;
									const resourceLinks = (resourcesByObjectId?.[l.objectId] || []).slice().sort((a, b) => a.resourceId - b.resourceId);
									const isResourcesOpen = resourcesOpenObjectId === l.objectId;

									return (
										<React.Fragment key={l.objectId}>
											<tr style={{ borderTop: '1px solid rgba(255,215,0,0.12)' }}>
												<td style={{ padding: '10px 6px' }}>
													<div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
														{iconUrl ? <CpImage src={iconUrl} width={28} height={28} fit="cover" /> : null}
														<div style={{ fontWeight: 800, wordBreak: 'break-word' }}>{o?.name || `Objeto #${l.objectId}`}</div>
													</div>
												</td>

												<td style={{ padding: '10px 6px' }}>
													{isEditing ? (
														<input
															type="number"
															min={1}
															value={l.level}
															onChange={(e) => {
																const v = Math.max(1, toInt(e.target.value, 1));
																setLinks((prev) => (prev || []).map((x) => (x.objectId === l.objectId ? { ...x, level: v } : x)));
															}}
															style={{ padding: 6, width: '100%' }}
														/>
													) : (
														<span style={{ fontSize: 13, opacity: 0.95 }}>{l.level}</span>
													)}
												</td>

												<td style={{ padding: '10px 6px' }}>
													{isEditing ? (
														<input
															type="number"
															min={0}
															value={l.quantity}
															onChange={(e) => {
																const v = Math.max(0, toInt(e.target.value, 1));
																setLinks((prev) => (prev || []).map((x) => (x.objectId === l.objectId ? { ...x, quantity: v } : x)));
															}}
															style={{ padding: 6, width: '100%' }}
														/>
													) : (
														<span style={{ fontSize: 13, opacity: 0.95 }}>{l.quantity}</span>
													)}
												</td>

												<td style={{ padding: '10px 6px' }}>
													{isEditing ? (
														<input
															type="number"
															min={0}
															value={l.timeSeconds}
															onChange={(e) => {
																const v = Math.max(0, toInt(e.target.value, 0));
																setLinks((prev) => (prev || []).map((x) => (x.objectId === l.objectId ? { ...x, timeSeconds: v } : x)));
															}}
															style={{ padding: 6, width: '100%' }}
														/>
													) : (
														<span style={{ fontSize: 13, opacity: 0.95 }}>{l.timeSeconds}</span>
													)}
												</td>

												<td style={{ padding: '10px 6px' }}>
													<div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
														{resourceLinks.length === 0 ? <span style={{ fontSize: 13, opacity: 0.9 }}>—</span> : null}
														{resourceLinks.map((rl) => {
																const r = resourcesById.get(rl.resourceId);
																const rIconUrl = asImageUrl(r?.icon);
																const title = r?.name || `Recurso #${rl.resourceId}`;
																return (
																	<span key={rl.resourceId} title={title} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
																		{rIconUrl ? (
																			<CpImage src={rIconUrl} width={18} height={18} fit="contain" showFrame={false} />
																		) : (
																			<div style={{ width: 18, height: 18, border: '1px solid rgba(255,215,0,0.25)', borderRadius: 3 }} />
																		)}
																		<span style={{ fontSize: 13, opacity: 0.95 }}>x{rl.quantity}</span>
																	</span>
																);
															})}

														<button
															className="icon option"
															title="Editar recursos"
															aria-label="Editar recursos"
															onClick={() => {
																setSelectedResourceId('');
																setNewResourceQuantity(1);
																setResourcesOpenObjectId(l.objectId);
															}}
														>
															<FaPlus size={16} />
														</button>
													</div>
												</td>

												<td style={{ padding: '10px 6px', textAlign: 'right', whiteSpace: 'nowrap' }}>
													<button
														className="icon option"
														title={isEditing ? 'Cerrar edición' : 'Editar'}
														aria-label={isEditing ? 'Cerrar edición' : 'Editar'}
														onClick={() => setEditingObjectId((prev) => (prev === l.objectId ? null : l.objectId))}
													>
														<FaEdit size={16} />
													</button>
													<button
														className="icon option"
														title="Desvincular"
														aria-label="Desvincular"
														onClick={() => {
															setPendingUnlink(l);
															setConfirmUnlinkOpen(true);
														}}
													>
														<FaTrash size={16} />
													</button>
												</td>
											</tr>

											{isResourcesOpen ? (
												<tr style={{ borderTop: '1px solid rgba(255,215,0,0.08)' }}>
													<td colSpan={6} style={{ padding: '10px 6px' }}>
														<div className="block-border block-border-soft" style={{ padding: 10 }}>
															<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
																<div style={{ fontWeight: 800 }}>Recursos del objeto</div>
																<button className="icon option" title="Cerrar" aria-label="Cerrar" onClick={() => setResourcesOpenObjectId(null)}>
																	<FaTimes size={16} />
																</button>
															</div>

															<div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
																<IconSelect value={selectedResourceId} placeholder="Selecciona un recurso..." items={availableResourceItems} onChange={setSelectedResourceId} />
																<label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, opacity: 0.9, width: 120 }}>
																	Cantidad
																	<input type="number" min={0} value={newResourceQuantity} onChange={(e) => setNewResourceQuantity(toInt(e.target.value, 1))} style={{ padding: 6 }} />
																</label>
																<button
																	className="icon option"
																	title="Añadir recurso"
																	aria-label="Añadir recurso"
																	disabled={!selectedResourceId}
																	onClick={() => {
																		if (!selectedResourceId) return;
																		const rid = Number(selectedResourceId);
																		const qty = Math.max(0, toInt(newResourceQuantity, 1));
																		setResourcesByObjectId((prev) => {
																			const current = (prev?.[l.objectId] || []).filter((x) => x.resourceId !== rid);
																			const next = current.concat({ professionId, objectId: l.objectId, resourceId: rid, quantity: qty });
																			return { ...prev, [l.objectId]: next };
																		});
																	setSelectedResourceId('');
																	setNewResourceQuantity(1);
																}}
																>
																	<FaPlus size={16} />
																</button>
															</div>

															<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
																{(resourcesByObjectId?.[l.objectId] || []).length === 0 ? (
																	<div style={{ opacity: 0.85, fontSize: 13 }}>No hay recursos asociados a este objeto.</div>
																) : null}
																{(resourcesByObjectId?.[l.objectId] || []).map((rl) => {
																	const r = resourcesById.get(rl.resourceId);
																	const rIcon = asImageUrl(r?.icon);
																	const rTitle = r?.name || `Recurso #${rl.resourceId}`;
																	return (
																		<div key={rl.resourceId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
																			<span title={rTitle} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '1 1 auto' }}>
																				{rIcon ? <CpImage src={rIcon} width={16} height={16} fit="contain" showFrame={false} /> : <div style={{ width: 16, height: 16 }} />}
																				<span style={{ fontWeight: 700, opacity: 0.95 }}>{r?.name || `Recurso #${rl.resourceId}`}</span>
																			</span>
																			<label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, opacity: 0.9, width: 120 }}>
																				Cantidad
																				<input
																					type="number"
																					min={0}
																					value={rl.quantity}
																					onChange={(e) => {
																						const v = Math.max(0, toInt(e.target.value, 1));
																						setResourcesByObjectId((prev) => {
																							const next = (prev?.[l.objectId] || []).map((x) => (x.resourceId === rl.resourceId ? { ...x, quantity: v } : x));
																						return { ...prev, [l.objectId]: next };
																					});
																				}}
																				style={{ padding: 6 }}
																				/>
																			</label>
																			<button
																				className="icon option"
																				title="Quitar recurso"
																				aria-label="Quitar recurso"
																				onClick={() => {
																					setResourcesByObjectId((prev) => {
																							const next = (prev?.[l.objectId] || []).filter((x) => x.resourceId !== rl.resourceId);
																							return { ...prev, [l.objectId]: next };
																					});
																				}}
																			>
																				<FaTrash size={16} />
																			</button>
																		</div>
																	);
																})}
															</div>
														</div>
													</td>
												</tr>
											) : null}
										</React.Fragment>
									);
								})}
							</tbody>
						</table>
						{(links || []).length === 0 ? <div style={{ marginTop: 10, opacity: 0.85, fontSize: 13 }}>No hay objetos asociados todavía.</div> : null}
					</div>
				</div>
			</div>

			<GameObjectModal
				open={objectModalOpen}
				existing={objects}
				onClose={() => setObjectModalOpen(false)}
				onSubmit={async (data) => {
					try {
						let iconValue = (data.icon || '').trim();
						if (data.iconFile) iconValue = await uploadObjectIcon(data.iconFile);
						await createObject({
							name: data.name,
							icon: iconValue || undefined,
							description: data.description,
							fileLink: data.fileLink,
						});
						setObjectModalOpen(false);
						await refresh();
					} catch (e: any) {
						console.error('Error creando objeto', e);
						alert(e?.message || 'Error creando objeto');
					}
				}}
			/>

			<ConfirmModal
				open={confirmUnlinkOpen}
				message={'¿Desvincular este objeto de la profesión?'}
				onConfirm={async () => {
					const target = pendingUnlink;
					setConfirmUnlinkOpen(false);
					setPendingUnlink(null);
					if (!target) return;
					setLinks((prev) => (prev || []).filter((x) => x.objectId !== target.objectId));
					setResourcesByObjectId((prev) => ({ ...prev, [target.objectId]: [] }));
					if (resourcesOpenObjectId === target.objectId) setResourcesOpenObjectId(null);
					if (editingObjectId === target.objectId) setEditingObjectId(null);
				}}
				onCancel={() => {
					setConfirmUnlinkOpen(false);
					setPendingUnlink(null);
				}}
			/>
		</div>
	);
};

export default ProfessionDetail;
