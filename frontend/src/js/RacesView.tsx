import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaPaw, FaExclamation } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa';
import { FaEdit, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import RaceModal from '../components/RaceModal';
import CpImage from '../components/CpImage';
import ClearableSearchInput from '../components/ClearableSearchInput';
import { AnimationItem } from '../interfaces/animation';
import { RaceItem } from '../interfaces/race';
import { SoundItem } from '../interfaces/sound';
import { getAnimations } from './animationApi';
import { createRace, deleteRace, getRaces, updateRace, uploadRaceIcon } from './raceApi';
import { getSounds } from './soundApi';

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

function capitalizeFirst(raw?: string): string {
	const v = String(raw ?? '').trim();
	if (!v) return '';
	return v.charAt(0).toUpperCase() + v.slice(1);
}

const RacesView: React.FC<Props> = ({ onBack }) => {
	const [races, setRaces] = useState<RaceItem[]>([]);
	const [sounds, setSounds] = useState<SoundItem[]>([]);
	const [animations, setAnimations] = useState<AnimationItem[]>([]);
	const [search, setSearch] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [selectedRace, setSelectedRace] = useState<RaceItem | null>(null);
	const [selectedAnimationIds, setSelectedAnimationIds] = useState<number[]>([]);
	const [savingAnimations, setSavingAnimations] = useState(false);

	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<RaceItem> | undefined>(undefined);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<RaceItem | null>(null);

	const refresh = useCallback(async () => {
		setError(null);
		const [r, s, a] = await Promise.all([
			getRaces().catch((e: any) => {
				setError((prev) => prev || (e?.message || 'No se pudieron cargar las razas.'));
				return [] as RaceItem[];
			}),
			getSounds().catch((e: any) => {
				setError((prev) => prev || (e?.message || 'No se pudieron cargar los sonidos.'));
				return [] as SoundItem[];
			}),
			getAnimations().catch((e: any) => {
				setError((prev) => prev || (e?.message || 'No se pudieron cargar las animaciones.'));
				return [] as AnimationItem[];
			}),
		]);
		setRaces(r || []);
		setSounds(s || []);
		setAnimations(a || []);
	}, []);

	useEffect(() => {
		refresh().catch((e) => console.error(e));
	}, [refresh]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const list = q
			? (races || []).filter((r) => {
				const defenseName = String(r.armorTypeEntity?.name || r.armorType || '').toLowerCase();
				return (r.name || '').toLowerCase().includes(q) || defenseName.includes(q) || String(r.movementType || '').toLowerCase().includes(q);
			})
			: (races || []);
		return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [races, search]);

	const orderedAnimations = useMemo(() => {
		return (animations || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [animations]);

	useEffect(() => {
		if (!selectedRace) return;
		const ids = (selectedRace.animations || []).map((x) => x.id).filter((x) => Number.isFinite(x as any)) as number[];
		const unique = Array.from(new Set(ids));
		setSelectedAnimationIds(unique);
	}, [selectedRace]);

	if (selectedRace) {
		const r = selectedRace;
		const iconUrl = asImageUrl(r.icon);
		const sound = sounds.find((s) => s.id === (r.movementSoundId || undefined));
		const soundFile = asImageUrl(sound?.file);
		const selectedSet = new Set(selectedAnimationIds);
		return (
			<div className="panel panel-corners-soft block-border block-panel-border">
				<div className="panel-header" style={{ position: 'relative' }}>
					<button className="icon" onClick={() => setSelectedRace(null)} title="Volver" aria-label="Volver">
						<FaArrowLeft size={22} color="#FFD700" />
					</button>
					<div
						style={{
							position: 'absolute',
							zIndex: 30,
							pointerEvents: 'none',
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
							padding: '6px 80px 8px 80px',
							minWidth: 0,
						}}
					>
						<div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.1 }}>Raza</div>
						<div
							style={{
								fontSize: 22,
								fontWeight: 900,
								lineHeight: 1.1,
								minWidth: 0,
								wordBreak: 'break-word',
							}}
						>
							{(r.name || '').trim() || '—'}
						</div>
					</div>
					<div style={{ width: 40 }} />
				</div>

				<div style={{ padding: 12 }}>
					<div className="block-border block-border-soft" style={{ padding: 12 }}>
						<div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
							<CpImage src={iconUrl} width={96} height={96} fit="cover" />
							<div style={{ flex: '1 1 320px', minWidth: 260 }}>
								<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
									<div>
										<div className="chapter-label">Armadura</div>
										<div>{capitalizeFirst(r.armorTypeEntity?.name || r.armorType || '') || '-'}</div>
									</div>
									<div>
										<div className="chapter-label">Tipo de muerte</div>
										<div>{capitalizeFirst(r.deathType) || '-'}</div>
									</div>
									<div>
										<div className="chapter-label">Defensa base</div>
										<div>{Number.isFinite(r.baseDefense as any) ? r.baseDefense : '-'}</div>
									</div>
									<div>
										<div className="chapter-label">Velocidad de movimiento</div>
										<div>{Number.isFinite(r.movementSpeed as any) ? r.movementSpeed : '-'}</div>
									</div>
									<div>
										<div className="chapter-label">Tipo de movimiento</div>
										<div>{capitalizeFirst(r.movementType) || '-'}</div>
									</div>
									<div>
										<div className="chapter-label">Sonido de movimiento</div>
										<div>
											{sound ? (
												<div>
													<div style={{ fontWeight: 800 }}>{sound.name}</div>
													{soundFile ? (
														<a href={soundFile} target="_blank" rel="noreferrer" style={{ color: '#e2c044', textDecoration: 'underline', wordBreak: 'break-all' }}>
															{(sound.file || '').trim()}
														</a>
													) : (
														<span style={{ opacity: 0.85 }}>(sin archivo)</span>
													)}
												</div>
											) : (
												<span style={{ opacity: 0.85 }}>-</span>
											)}
										</div>
									</div>
									<div>
										<div className="chapter-label">Vida base</div>
										<div>{Number.isFinite(r.baseLife as any) ? r.baseLife : '-'}</div>
									</div>
									<div>
										<div className="chapter-label">Regeneración de vida</div>
										<div>{Number.isFinite(r.lifeRegen as any) ? r.lifeRegen : '-'}</div>
									</div>
									<div>
										<div className="chapter-label">Mana base</div>
										<div>{Number.isFinite(r.baseMana as any) ? r.baseMana : '-'}</div>
									</div>
									<div>
										<div className="chapter-label">Regeneración de mana</div>
										<div>{Number.isFinite(r.baseManaRegen as any) ? r.baseManaRegen : '-'}</div>
									</div>
									<div>
										<div className="chapter-label">Mana inicial</div>
																				<div className="chapter-label">Defensa</div>
									</div>
									<div>
										<div className="chapter-label">Tamaño de transporte</div>
										<div>{Number.isFinite(r.transportSize as any) ? r.transportSize : '-'}</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="block-border block-border-soft" style={{ padding: 12, marginTop: 12 }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
							<div style={{ fontWeight: 900 }}>Animaciones</div>
							<button
								className="icon option"
								title="Guardar animaciones"
								disabled={savingAnimations}
								onClick={async () => {
									setSavingAnimations(true);
									try {
										const updated = await updateRace(r.id, { animationIds: selectedAnimationIds });
										setSelectedRace(updated);
										setRaces((prev) => (prev || []).map((it) => (it.id === updated.id ? updated : it)));
									} finally {
										setSavingAnimations(false);
									}
								}}
							>
								{savingAnimations ? '...' : 'Confirmar'}
							</button>
						</div>

						{orderedAnimations.length === 0 ? (
							<div style={{ marginTop: 8, opacity: 0.85, fontSize: 13 }}>No hay animaciones creadas todavía.</div>
						) : (
							<div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
								{orderedAnimations.map((a) => (
									<label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: 0.95 }}>
										<input
											type="checkbox"
											checked={selectedSet.has(a.id)}
											onChange={(e) => {
												const checked = e.target.checked;
												setSelectedAnimationIds((prev) => {
													const cur = new Set(prev);
													if (checked) cur.add(a.id);
													else cur.delete(a.id);
													return Array.from(cur.values());
												});
											}}
										/>
										<span style={{ wordBreak: 'break-word' }}>{a.name}</span>
									</label>
								))}
							</div>
						)}
					</div>
				</div>
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
						maxWidth: 'calc(100% - 160px)',
						padding: '6px 80px 8px 80px',
						minWidth: 0,
					}}
				>
					<div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.1 }}>Listado</div>
					<div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>Razas</div>
				</div>
				<button
					className="icon"
					aria-label="Nueva Raza"
					title="Nueva Raza"
					onClick={() => {
						setInitial(undefined);
						setModalOpen(true);
					}}
				>
					<FaPaw size={22} color="#FFD700" />
				</button>
			</div>

			<div className="filters-bar">
				<div className="filters-row">
					<ClearableSearchInput
						value={search}
						onChange={(v) => setSearch(v)}
						placeholder="Buscar raza..."
						className="filters-input"
					/>
				</div>
			</div>

			{error ? (
				<div style={{ padding: '0 12px 12px 12px', color: '#e2d9b7', opacity: 0.95, fontSize: 13 }}>{error}</div>
			) : null}

			<div style={{ padding: 12 }}>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
					{filtered.map((r) => {
						const iconUrl = asImageUrl(r.icon);
						const showBaseLifeWarning = Number(r.baseLife) <= 0;
						const baseLifeWarningText = 'Vida base es 0';
						return (
							<div
								key={r.id}
								className="block-border block-border-soft mechanic-card"
								style={{ padding: 12, cursor: 'pointer', position: 'relative' }}
								role="button"
								tabIndex={0}
								onClick={() => setSelectedRace(r)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') setSelectedRace(r);
								}}
							>
								{showBaseLifeWarning ? (
									<span
										className="campaign-warning"
										data-tooltip={baseLifeWarningText}
										aria-label={baseLifeWarningText}
										onClick={(e) => e.stopPropagation()}
										onPointerDown={(e) => e.stopPropagation()}
									>
										<FaExclamation size={14} />
									</span>
								) : null}
								<div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
									<div style={{ minWidth: 0 }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
											<CpImage src={iconUrl} width={64} height={64} fit="cover" frameStyle={{ flex: '0 0 auto' }} />
											<div style={{ minWidth: 0 }}>
												<div style={{ fontWeight: 900, wordBreak: 'break-word' }}>{r.name}</div>
												<div style={{ marginTop: 2, opacity: 0.9, fontSize: 13 }}>Armadura: {capitalizeFirst(r.armorTypeEntity?.name || r.armorType || '') || '-'}</div>
												<div style={{ marginTop: 2, opacity: 0.9, fontSize: 13 }}>Movimiento: {capitalizeFirst(r.movementType) || '-'}</div>
											</div>
										</div>
									</div>

									<div className="mechanic-actions" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
										<button
											className="icon option"
											title="Editar"
											onClick={(e) => {
											e.stopPropagation();
												setInitial(r);
												setModalOpen(true);
											}}
										>
											<FaEdit size={16} />
										</button>
										<button
											className="icon option"
											title="Eliminar"
											onClick={(e) => {
											e.stopPropagation();
												setPendingDelete(r);
												setConfirmOpen(true);
											}}
										>
											<FaTrash size={16} />
										</button>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{filtered.length === 0 ? <div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay razas todavía.</div> : null}
			</div>

			{modalOpen ? (
				<RaceModal
					open={modalOpen}
					initial={initial}
					existing={races}
					sounds={sounds}
					onClose={() => {
						setModalOpen(false);
						setInitial(undefined);
					}}
					onSubmit={async (data) => {
						const anyData = data as any;
						const iconFile: File | null | undefined = anyData?.iconFile;
						let icon = (data.icon || '').trim();
						if ((anyData as any).removeIcon) {
							icon = '';
						} else if (iconFile) {
							const uploaded = await uploadRaceIcon(iconFile);
							if (uploaded) icon = uploaded;
						}

						const { iconFile: _ignored, ...rest } = anyData;
						const payload = { ...rest, icon };

						if (initial?.id) await updateRace(initial.id as number, payload);
						else await createRace(payload);
						await refresh();
						setModalOpen(false);
						setInitial(undefined);
					}}
				/>
			) : null}

			<ConfirmModal
				open={confirmOpen}
				requireText="eliminar"
				message={'¿Estás seguro de que deseas eliminar esta raza?'}
				onConfirm={async () => {
					const target = pendingDelete;
					setConfirmOpen(false);
					setPendingDelete(null);
					if (!target) return;
					await deleteRace(target.id);
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

export default RacesView;
