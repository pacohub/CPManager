import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaEdit, FaExclamationTriangle, FaPlus, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import CharacterModal from '../components/CharacterModal';
import AnimationModal from '../components/AnimationModal';
import { AnimationItem } from '../interfaces/animation';
import { CharacterItem } from '../interfaces/character';
import { ClassItem } from '../interfaces/class';
import { RaceItem } from '../interfaces/race';
import { SoundItem } from '../interfaces/sound';
import { createAnimation, getAnimations } from './animationApi';
import { getClasses } from './classApi';
import { createCharacterInstance, deleteCharacterInstance, getCharacter, getCharacterInstances, updateCharacter, updateCharacterInstance, uploadCharacterIcon, uploadCharacterImage } from './characterApi';
import { getRaces } from './raceApi';
import { getSounds } from './soundApi';

function asImageUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

function normalizeLink(raw: string): string {
	const v = (raw || '').trim();
	if (!v) return '';
	if (/^https?:\/\//i.test(v)) return v;
	if (v.startsWith('/')) return `http://localhost:4000${v}`;
	return v;
}

interface Props {
	characterId: number;
	onBack: () => void;
}

const CharacterDetail: React.FC<Props> = ({ characterId, onBack }) => {
	const [character, setCharacter] = useState<CharacterItem | null>(null);
	const [instances, setInstances] = useState<CharacterItem[]>([]);
	const [classes, setClasses] = useState<ClassItem[]>([]);
	const [races, setRaces] = useState<RaceItem[]>([]);
	const [sounds, setSounds] = useState<SoundItem[]>([]);
	const [animations, setAnimations] = useState<AnimationItem[]>([]);
	const [ownAnimationIds, setOwnAnimationIds] = useState<number[]>([]);
	const [savingAnimations, setSavingAnimations] = useState(false);
	const [addAnimOpen, setAddAnimOpen] = useState(false);
	const [selectedExistingAnimId, setSelectedExistingAnimId] = useState<number | string>(0);
	const [createAnimModalOpen, setCreateAnimModalOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [modalOpen, setModalOpen] = useState(false);
	const [modalInitial, setModalInitial] = useState<Partial<CharacterItem> | undefined>(undefined);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<CharacterItem | null>(null);

	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [c, inst, klasses, r, s, a] = await Promise.all([
				getCharacter(characterId),
				getCharacterInstances(characterId),
				getClasses(),
				getRaces(),
				getSounds(),
				getAnimations(),
			]);
			setCharacter(c);
			setInstances(inst || []);
			setClasses(klasses || []);
			setRaces(r || []);
			setSounds(s || []);
			setAnimations(a || []);
		} catch (e: any) {
			setError(e?.message || 'Error cargando el personaje');
		} finally {
			setLoading(false);
		}
	}, [characterId]);

	useEffect(() => {
		refresh().catch((e) => console.error(e));
	}, [refresh]);

	const iconUrl = useMemo(() => asImageUrl(character?.icon), [character?.icon]);
	const imageUrl = useMemo(() => asImageUrl((character as any)?.image), [character]);
	const classById = useMemo(() => new Map((classes || []).map((c) => [c.id, c])), [classes]);
	const raceById = useMemo(() => new Map((races || []).map((r) => [r.id, r])), [races]);

	useEffect(() => {
		if (!character) return;
		const ids = (character.animations || []).map((x) => x.id).filter((x) => Number.isFinite(x as any)) as number[];
		setOwnAnimationIds(Array.from(new Set(ids)));
	}, [character]);

	const orderedAnimations = useMemo(() => {
		return (animations || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [animations]);

	const raceAnimations = useMemo(() => {
		return (character?.race?.animations || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [character]);

	const classAnimations = useMemo(() => {
		return (character?.class?.animations || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [character]);

	const effectiveAnimations = useMemo(() => {
		const byId = new Map<number, AnimationItem>();
		for (const a of raceAnimations) byId.set(a.id, a);
		for (const a of classAnimations) byId.set(a.id, a);
		for (const id of ownAnimationIds) {
			const found = (orderedAnimations || []).find((x) => x.id === id);
			if (found) byId.set(found.id, found);
		}
		return Array.from(byId.values()).sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [raceAnimations, classAnimations, ownAnimationIds, orderedAnimations]);

	const raceAnimIdSet = useMemo(() => new Set((raceAnimations || []).map((a) => a.id)), [raceAnimations]);
	const classAnimIdSet = useMemo(() => new Set((classAnimations || []).map((a) => a.id)), [classAnimations]);
	const ownAnimIdSet = useMemo(() => new Set((ownAnimationIds || []).map((id) => Number(id))), [ownAnimationIds]);
	const associatedAnimIdSet = useMemo(() => {
		const out = new Set<number>();
		for (const id of raceAnimIdSet) out.add(id);
		for (const id of classAnimIdSet) out.add(id);
		for (const id of ownAnimIdSet) out.add(id);
		return out;
	}, [raceAnimIdSet, classAnimIdSet, ownAnimIdSet]);

	const availableExistingAnimations = useMemo(() => {
		return (orderedAnimations || []).filter((a) => !associatedAnimIdSet.has(a.id));
	}, [orderedAnimations, associatedAnimIdSet]);

	useEffect(() => {
		if (!addAnimOpen) return;
		if (availableExistingAnimations.length === 0) {
			setSelectedExistingAnimId('__NEW__');
			return;
		}
		const numericSelected = typeof selectedExistingAnimId === 'number' ? selectedExistingAnimId : Number(selectedExistingAnimId);
		const ok = Number.isFinite(numericSelected) && availableExistingAnimations.some((a) => a.id === numericSelected);
		if (!ok) setSelectedExistingAnimId(availableExistingAnimations[0].id);
	}, [addAnimOpen, availableExistingAnimations, selectedExistingAnimId]);

	const persistOwnAnimationIds = useCallback(
		async (nextIds: number[]) => {
			if (!character) return;
			setSavingAnimations(true);
			setError(null);
			try {
				const unique = Array.from(new Set((nextIds || []).map((x) => Number(x)).filter((x) => Number.isFinite(x) && x > 0)));
				const updated = await updateCharacter(character.id, { animationIds: unique });
				setCharacter(updated);
				const ids = (updated.animations || []).map((x) => x.id).filter((x) => Number.isFinite(x as any)) as number[];
				setOwnAnimationIds(Array.from(new Set(ids)));
			} catch (e: any) {
				setError(e?.message || 'Error guardando animaciones');
			} finally {
				setSavingAnimations(false);
			}
		},
		[character],
	);

	const handleCreateAndAssociate = useCallback(
		async (data: { name: string }) => {
			const name = String(data?.name || '').trim();
			if (!name) return;
			setSavingAnimations(true);
			setError(null);
			try {
				const created = await createAnimation({ name });
				setAnimations((prev) => {
					const cur = (prev || []).slice();
					if (!cur.some((x) => x.id === created.id)) cur.push(created);
					return cur;
				});
				const next = Array.from(new Set([...(ownAnimationIds || []), created.id]));
				await persistOwnAnimationIds(next);
				setCreateAnimModalOpen(false);
				setAddAnimOpen(false);
			} catch (e: any) {
				setError(e?.message || 'Error creando animación');
			} finally {
				setSavingAnimations(false);
			}
		},
		[ownAnimationIds, persistOwnAnimationIds],
	);

	if (loading) {
		return (
			<div className="panel panel-corners-soft block-border block-panel-border">
				<div className="panel-header">
					<button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
						<FaArrowLeft size={22} color="#FFD700" />
					</button>
					<h1 style={{ margin: 0 }}>Personaje</h1>
					<div style={{ width: 32 }} />
				</div>
				<div style={{ padding: 12, opacity: 0.9 }}>Cargando...</div>
			</div>
		);
	}

	if (error || !character) {
		return (
			<div className="panel panel-corners-soft block-border block-panel-border">
				<div className="panel-header">
					<button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
						<FaArrowLeft size={22} color="#FFD700" />
					</button>
					<h1 style={{ margin: 0 }}>Personaje</h1>
					<div style={{ width: 32 }} />
				</div>
				<div style={{ padding: 12, color: '#e2d9b7', opacity: 0.95 }}>{error || 'No se pudo cargar el personaje.'}</div>
			</div>
		);
	}

	return (
		<div className="panel panel-corners-soft block-border block-panel-border">
			<div className="panel-header">
				<button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
					<FaArrowLeft size={22} color="#FFD700" />
				</button>
				<h1 style={{ margin: 0 }}>Personaje</h1>
				<div style={{ width: 32 }} />
			</div>

			<div style={{ padding: 12 }}>
				<div
					style={{
						display: 'flex',
						gap: 12,
						alignItems: 'stretch',
						flexWrap: 'wrap',
						marginBottom: 12,
						minHeight: imageUrl ? 520 : undefined,
					}}
				>
					<div style={{ flex: '1 1 360px', minWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
						<div className="block-border block-border-soft" style={{ padding: 12 }}>
							<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
								{iconUrl ? (
									<div className="metallic-border metallic-border-square" style={{ width: 64, height: 64, minWidth: 64, backgroundImage: 'none' }}>
										<img src={iconUrl} alt="" aria-hidden="true" style={{ width: 64, height: 64, objectFit: 'cover', display: 'block' }} />
									</div>
								) : null}
								<div style={{ minWidth: 0 }}>
									<div style={{ fontWeight: 900, fontSize: 18, wordBreak: 'break-word' }}>{character.name}</div>
									<div style={{ marginTop: 2, opacity: 0.9, fontSize: 13 }}>
										Clase: {character.class?.name || `#${character.classId}`}
									</div>
									<div style={{ marginTop: 2, opacity: 0.9, fontSize: 13 }}>
										Raza: {character.race?.name || raceById.get(Number((character as any)?.raceId) || 0)?.name || (Number((character as any)?.raceId) ? `#${(character as any)?.raceId}` : '-')}
									</div>
									{(character.model || '').trim() ? (
										<div style={{ marginTop: 6, fontSize: 13, opacity: 0.9, wordBreak: 'break-all' }}>
											Modelo:{' '}
											<a href={normalizeLink(character.model || '')} target="_blank" rel="noreferrer" style={{ color: '#e2c044', textDecoration: 'underline' }}>
												{(character.model || '').trim()}
											</a>
										</div>
									) : null}
								</div>
							</div>
						</div>

						<div className="block-border block-border-soft" style={{ padding: 12 }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
								<div style={{ fontWeight: 900 }}>Animaciones</div>
								<button
									className="icon option"
									title="Añadir animación"
									aria-label="Añadir animación"
									disabled={savingAnimations}
									onClick={() => setAddAnimOpen((v) => !v)}
								>
									<FaPlus size={16} />
								</button>
							</div>

							{addAnimOpen ? (
								<div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
									<div>
										<div className="chapter-label">Añadir animación</div>
										<div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
											<select
												value={selectedExistingAnimId as any}
												onChange={(e) => setSelectedExistingAnimId(e.target.value)}
												style={{ flex: '1 1 240px', minWidth: 200 }}
											>
												{availableExistingAnimations.map((a) => (
													<option key={a.id} value={String(a.id)}>
														{a.name}
													</option>
												))}
												<option value="__NEW__">Crear nueva animación...</option>
											</select>
											<button
												className="icon option"
												title="Añadir"
												aria-label="Añadir"
												disabled={savingAnimations}
												onClick={async () => {
													if (selectedExistingAnimId === '__NEW__') {
														setCreateAnimModalOpen(true);
														return;
													}
													const id = Number(selectedExistingAnimId);
													if (!Number.isFinite(id) || id <= 0) return;
													const next = Array.from(new Set([...(ownAnimationIds || []), id]));
													await persistOwnAnimationIds(next);
													setAddAnimOpen(false);
												}}
											>
												<FaPlus size={14} />
											</button>
										</div>
										{availableExistingAnimations.length === 0 ? (
											<div style={{ marginTop: 6, opacity: 0.85, fontSize: 13 }}>No hay animaciones existentes disponibles para añadir.</div>
										) : null}
									</div>
								</div>
							) : null}

							<div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
								{effectiveAnimations.length === 0 ? (
									<div style={{ opacity: 0.85, fontSize: 13 }}>-</div>
								) : (
									effectiveAnimations.map((a) => {
										const inRace = raceAnimIdSet.has(a.id);
										const inClass = classAnimIdSet.has(a.id);
										const inOwn = ownAnimIdSet.has(a.id);
										const origin = inOwn ? 'Propia' : inRace && inClass ? 'Raza+Clase' : inRace ? 'Raza' : inClass ? 'Clase' : '';
										return (
											<div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
												<div style={{ minWidth: 0, wordBreak: 'break-word' }}>{a.name}</div>
												<div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
													{origin ? <span style={{ opacity: 0.85, fontSize: 12, whiteSpace: 'nowrap' }}>{origin}</span> : null}
													{inOwn ? (
														<button
															className="icon option"
															title="Quitar animación propia"
															aria-label="Quitar animación propia"
															disabled={savingAnimations}
															onClick={async () => {
																const next = (ownAnimationIds || []).filter((id) => id !== a.id);
																await persistOwnAnimationIds(next);
															}}
														>
															<FaTrash size={14} />
														</button>
													) : null}
												</div>
											</div>
										);
									})
								)}
							</div>
						</div>
					</div>

					<div style={{ flex: '2 1 420px', minWidth: 320, alignSelf: 'stretch' }}>
						{imageUrl ? (
							<div className="block-border block-border-soft" style={{ padding: 8, height: '100%' }}>
								<img
									src={imageUrl}
									alt=""
									aria-hidden="true"
									style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
								/>
							</div>
						) : null}
					</div>
				</div>

				<div style={{ padding: 12 }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
						<div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
							<div style={{ fontWeight: 900 }}>Instancias</div>
							<div style={{ opacity: 0.9, fontSize: 13 }}>Total: {instances.length}</div>
						</div>
						<button
							className="icon option"
							title="Agregar instancia"
							onClick={() => {
								setModalInitial(undefined);
								setModalOpen(true);
							}}
						>
							<FaPlus size={16} />
						</button>
					</div>

					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
						{instances
							.slice()
							.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }))
							.map((inst) => {
								const instImageUrl = asImageUrl((inst as any)?.image);
								const instIconUrl = asImageUrl(inst.icon);
								const instClassName = classById.get(inst.classId)?.name || inst.class?.name;
								const instRaceName = raceById.get(Number((inst as any)?.raceId) || 0)?.name || inst.race?.name;
								const displayName = `${character.name}: ${inst.name}`;
								const missing: string[] = [];
								if (!instIconUrl) missing.push('icono');
								if (!instClassName && !(Number.isFinite(inst.classId as any) && Number(inst.classId) > 0)) missing.push('clase');
								if (!instRaceName && !(Number.isFinite((inst as any)?.raceId as any) && Number((inst as any)?.raceId) > 0)) missing.push('raza');
								if (!String(inst.model ?? '').trim()) missing.push('modelo');
								const showWarning = missing.length > 0;
								const warningText = `Falta: ${missing.join(', ')}.`;

								return (
									<div
										key={inst.id}
										className="campaign-card metallic-border"
										style={{
											minWidth: 220,
											minHeight: 220,
											margin: 0,
											cursor: 'default',
											backgroundImage: instImageUrl ? `url("${instImageUrl}")` : undefined,
										}}
										tabIndex={0}
										aria-label={displayName}
									>
										{showWarning ? (
											<span
												className="campaign-warning"
												title={warningText}
												aria-label={warningText}
											>
												<FaExclamationTriangle size={14} />
											</span>
										) : null}
										<div className="campaign-title">
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }}>
												{instIconUrl ? (
													<img src={instIconUrl} alt="" aria-hidden="true" style={{ width: 18, height: 18, objectFit: 'cover', display: 'block', flex: '0 0 auto' }} />
												) : null}
												<div style={{ wordBreak: 'break-word' }}>{displayName}</div>
											</div>
											{instClassName ? <div className="campaign-subtitle">Clase: {instClassName}</div> : null}
											{instRaceName ? <div className="campaign-subtitle">Raza: {instRaceName}</div> : null}
										</div>
										<div className="campaign-actions">
											<button
												className="icon option"
												title="Editar"
												onClick={(e) => {
													e.stopPropagation();
													setModalInitial(inst);
													setModalOpen(true);
												}}
												onPointerDown={(e) => e.stopPropagation()}
											>
												<FaEdit size={14} />
											</button>
											<button
												className="icon option"
												title="Eliminar"
												onClick={(e) => {
													e.stopPropagation();
													setPendingDelete(inst);
													setConfirmOpen(true);
												}}
												onPointerDown={(e) => e.stopPropagation()}
											>
												<FaTrash size={14} />
											</button>
										</div>
										<div className="campaign-desc">
											{String(inst.model ?? '').trim() ? (
												<div style={{ wordBreak: 'break-all' }}>Modelo: {String(inst.model ?? '').trim()}</div>
											) : (
												<div style={{ opacity: 0.95 }}>Sin modelo</div>
											)}
										</div>
									</div>
								);
							})}
					</div>
					{instances.length === 0 ? <div style={{ opacity: 0.85, fontSize: 13, color: '#e2d9b7' }}>No hay instancias todavía.</div> : null}
				</div>
			</div>

			<ConfirmModal
				open={confirmOpen}
				message={'¿Estás seguro de que deseas eliminar esta instancia?'}
				onConfirm={async () => {
					const target = pendingDelete;
					setConfirmOpen(false);
					setPendingDelete(null);
					if (!target) return;
					await deleteCharacterInstance(characterId, target.id);
					setInstances((prev) => prev.filter((x) => x.id !== target.id));
				}}
				onCancel={() => {
					setConfirmOpen(false);
					setPendingDelete(null);
				}}
			/>

			<AnimationModal
				open={createAnimModalOpen}
				initial={undefined}
				existing={animations}
				onClose={() => setCreateAnimModalOpen(false)}
				onSubmit={handleCreateAndAssociate}
			/>

			{modalOpen ? (
				<CharacterModal
					open={modalOpen}
					initial={modalInitial}
					existing={instances}
					classes={classes}
					races={races}
					sounds={sounds}
					onClose={() => {
						setModalOpen(false);
						setModalInitial(undefined);
					}}
					onSubmit={async (data) => {
						const anyData = data as any;
						const iconFile: File | null | undefined = anyData?.iconFile;
						const imageFile: File | null | undefined = anyData?.imageFile;

						let icon = (data.icon || '').trim();
						if (iconFile) {
							const uploaded = await uploadCharacterIcon(iconFile);
							if (uploaded) icon = uploaded;
						}

						let image = (data as any)?.image ? String((data as any).image).trim() : '';
						if (imageFile) {
							const uploaded = await uploadCharacterImage(imageFile);
							if (uploaded) image = uploaded;
						}

						const model = (data.model || '').trim();
						const { iconFile: _ignoredIcon, imageFile: _ignoredImage, ...rest } = anyData;
						const payload = { ...rest, icon, image, model } as { name: string; classId: number; raceId: number; icon?: string; image?: string; model?: string };

						if (modalInitial?.id) {
							const updated = await updateCharacterInstance(characterId, modalInitial.id, payload);
							setInstances((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
						} else {
							const created = await createCharacterInstance(characterId, payload);
							setInstances((prev) => [created, ...prev]);
						}

						setModalOpen(false);
						setModalInitial(undefined);
					}}
				/>
			) : null}
		</div>
	);
};

export default CharacterDetail;
