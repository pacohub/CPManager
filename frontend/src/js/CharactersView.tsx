import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { FaUser, FaExclamation } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa';
import { FaEdit, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import CharacterModal from '../components/CharacterModal';
import CpImage from '../components/CpImage';
import ClearableSearchInput from '../components/ClearableSearchInput';
import { CharacterItem } from '../interfaces/character';
import { ClassItem } from '../interfaces/class';
import { RaceItem } from '../interfaces/race';
import { SoundItem } from '../interfaces/sound';
import { getClasses } from './classApi';
import { createCharacter, deleteCharacter, getCharacters, updateCharacter, uploadCharacterIcon, uploadCharacterImage } from './characterApi';
import { getRaces } from './raceApi';
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
	onOpenCharacter?: (id: number) => void;
}

const CharactersView: React.FC<Props> = ({ onBack, onOpenCharacter }) => {
	const [characters, setCharacters] = useState<CharacterItem[]>([]);
	const [classes, setClasses] = useState<ClassItem[]>([]);
	const [races, setRaces] = useState<RaceItem[]>([]);
	const [sounds, setSounds] = useState<SoundItem[]>([]);
	const [search, setSearch] = useState('');
	const [error, setError] = useState<string | null>(null);

	const [tooltip, setTooltip] = useState<{ visible: boolean; text?: string; x?: number; y?: number }>({ visible: false });
	const [hoverPreview, setHoverPreview] = useState<{ id: number; rect: DOMRect } | null>(null);
	const [previewHovered, setPreviewHovered] = useState(false);
	const hideTimerRef = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
		};
	}, []);

	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<CharacterItem> | undefined>(undefined);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<CharacterItem | null>(null);

	const refresh = useCallback(async () => {
		setError(null);
		const [klasses, r, s, list] = await Promise.all([
			getClasses().catch((e: any) => {
				console.error('Error cargando clases', e);
				setError((prev) => prev || (e?.message || 'No se pudieron cargar las clases.'));
				return [] as ClassItem[];
			}),
			getRaces().catch((e: any) => {
				console.error('Error cargando razas', e);
				setError((prev) => prev || (e?.message || 'No se pudieron cargar las razas.'));
				return [] as RaceItem[];
			}),
			getSounds().catch((e: any) => {
				console.error('Error cargando sonidos', e);
				setError((prev) => prev || (e?.message || 'No se pudieron cargar los sonidos.'));
				return [] as SoundItem[];
			}),
			getCharacters().catch((e: any) => {
				console.error('Error cargando personajes', e);
				setError((prev) => prev || (e?.message || 'No se pudieron cargar los personajes.'));
				return [] as CharacterItem[];
			}),
		]);
		setClasses(klasses || []);
		setRaces(r || []);
		setSounds(s || []);
		setCharacters((list || []).filter((c) => !c.parentId));
	}, []);

	useEffect(() => {
		refresh().catch((e) => console.error('Error refrescando personajes/clases', e));
	}, [refresh]);

	const classById = useMemo(() => new Map((classes || []).map((c) => [c.id, c])), [classes]);
	const raceById = useMemo(() => new Map((races || []).map((r) => [r.id, r])), [races]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const list = q
			? (characters || []).filter((c) => {
				const className = classById.get(c.classId)?.name || c.class?.name || '';
				const raceName = raceById.get(Number((c as any)?.raceId) || 0)?.name || c.race?.name || '';
				return (c.name || '').toLowerCase().includes(q) || String(className).toLowerCase().includes(q) || String(raceName).toLowerCase().includes(q);
			})
			: (characters || []);
		return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [characters, search, classById, raceById]);

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
					<div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>Personajes</div>
				</div>
				<button
					className="icon"
					aria-label="Nuevo Personaje"
					title="Nuevo Personaje"
					onClick={() => {
						setInitial(undefined);
						setModalOpen(true);
					}}
				>
					<FaUser size={24} color="#FFD700" />
				</button>
			</div>

			<div className="filters-bar">
					<div className="filters-row">
						<ClearableSearchInput
							value={search}
							onChange={(v) => setSearch(v)}
							placeholder="Buscar personaje..."
							className="filters-input"
						/>
					</div>
			</div>
			{error ? (
				<div style={{ padding: '0 12px 12px 12px', color: '#e2d9b7', opacity: 0.95, fontSize: 13 }}>
					{error}
				</div>
			) : null}
			{search.trim() ? (
				<div style={{ marginTop: -8, marginBottom: 16, opacity: 0.9, fontSize: 13, padding: '0 12px' }}>Resultados: {filtered.length}</div>
			) : null}

			<div style={{ padding: 12 }}>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
					{filtered.map((c) => {
						const iconUrl = asImageUrl(c.icon);
						const className = classById.get(c.classId)?.name || c.class?.name;
						const raceName = raceById.get(Number((c as any)?.raceId) || 0)?.name || c.race?.name;
						const missing: string[] = [];
						if (!iconUrl) missing.push('icono');
						if (!className && !(Number.isFinite(c.classId as any) && Number(c.classId) > 0)) missing.push('clase');
						if (!raceName && !(Number.isFinite((c as any)?.raceId as any) && Number((c as any)?.raceId) > 0)) missing.push('raza');
						if (!(c.model || '').trim()) missing.push('modelo');
						const showWarning = missing.length > 0;
						const warningText = `Falta: ${missing.join(', ')}.`;
						return (
							<div
								key={c.id}
								className="block-border block-border-soft mechanic-card"
								style={{ padding: 12, cursor: onOpenCharacter ? 'pointer' : 'default', position: 'relative' }}
								onClick={() => onOpenCharacter?.(c.id)}
								onMouseEnter={(e) => {
									if (hideTimerRef.current) {
										window.clearTimeout(hideTimerRef.current);
										hideTimerRef.current = null;
									}
									const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
									setHoverPreview({ id: c.id, rect });
								}}
								onMouseLeave={() => {
									// delay hiding to allow moving into the preview without flicker
									if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
									hideTimerRef.current = window.setTimeout(() => {
										if (!previewHovered) setHoverPreview(null);
										hideTimerRef.current = null;
									}, 120) as unknown as number;
								}}
							>
								{showWarning ? (
									<span
										className="campaign-warning"
										title={warningText}
										aria-label={warningText}
										onClick={(e) => e.stopPropagation()}
										onPointerDown={(e) => e.stopPropagation()}
									>
										<FaExclamation size={14} />
									</span>
								) : null}
								<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'stretch' }}>
									<div style={{ minWidth: 0, flex: 1, display: 'flex', gap: 12, alignItems: 'stretch' }}>
										<CpImage src={iconUrl} width={64} height={64} fit="cover" frameClassName="metallic-border metallic-border-square" />
										<div style={{ minWidth: 0, flex: 1 }}>
												<div
													className="trunc-field name-field"
													style={{ fontWeight: 800, marginBottom: 2 }}
													tabIndex={0}
													aria-label={c.name}
													onMouseEnter={(e) => {
														const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
														setTooltip({ visible: true, text: c.name, x: rect.left + rect.width / 2, y: rect.bottom + 8 });
													}}
													onMouseMove={(e) => setTooltip((t) => (t.visible ? { ...t, x: e.clientX, y: e.clientY + 18 } : t))}
													onMouseLeave={() => setTooltip({ visible: false })}
													onFocus={(e) => {
														const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
														setTooltip({ visible: true, text: c.name, x: rect.left + rect.width / 2, y: rect.bottom + 8 });
													}}
													onBlur={() => setTooltip({ visible: false })}
												>
													{c.name}
												</div>
												{className ? (
													<div
														className="trunc-field"
														style={{ marginTop: 2, opacity: 0.9, fontSize: 13 }}
														tabIndex={0}
														aria-label={`Clase: ${className}`}
														onMouseEnter={(e) => {
															const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
															setTooltip({ visible: true, text: className, x: rect.left + rect.width / 2, y: rect.bottom + 8 });
														}}
														onMouseMove={(e) => setTooltip((t) => (t.visible ? { ...t, x: e.clientX, y: e.clientY + 18 } : t))}
														onMouseLeave={() => setTooltip({ visible: false })}
														onFocus={(e) => {
															const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
															setTooltip({ visible: true, text: className, x: rect.left + rect.width / 2, y: rect.bottom + 8 });
														}}
														onBlur={() => setTooltip({ visible: false })}
													>
														{className}
													</div>
												) : null}
												{raceName ? (
													<div
														className="trunc-field"
														style={{ marginTop: 2, opacity: 0.9, fontSize: 13 }}
														tabIndex={0}
														aria-label={`Raza: ${raceName}`}
														onMouseEnter={(e) => {
															const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
															setTooltip({ visible: true, text: raceName, x: rect.left + rect.width / 2, y: rect.bottom + 8 });
														}}
														onMouseMove={(e) => setTooltip((t) => (t.visible ? { ...t, x: e.clientX, y: e.clientY + 18 } : t))}
														onMouseLeave={() => setTooltip({ visible: false })}
														onFocus={(e) => {
															const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
															setTooltip({ visible: true, text: raceName, x: rect.left + rect.width / 2, y: rect.bottom + 8 });
														}}
														onBlur={() => setTooltip({ visible: false })}
													>
														{raceName}
													</div>
												) : null}
											{(c.model || '').trim() ? (
												<div style={{ marginTop: 6, opacity: 0.9, fontSize: 13, wordBreak: 'break-all' }}>Modelo: {(c.model || '').trim()}</div>
											) : null}
										</div>
									</div>

									<div
										className="mechanic-actions"
										style={{ display: 'flex', alignItems: 'flex-start', gap: 8, position: 'absolute', top: 10, right: 10, zIndex: 2 }}
									>
										<button
											className="icon option"
											title="Editar"
											onClick={(e) => {
												e.stopPropagation();
												setInitial(c);
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
												setPendingDelete(c);
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

				{hoverPreview ? (() => {
					const target = filtered.find((x) => x.id === hoverPreview.id) || characters.find((x) => x.id === hoverPreview.id);
					if (!target) return null;
					const rect = hoverPreview.rect;
					const preferRight = rect.right + 340 < window.innerWidth;
					const left = preferRight ? rect.right + 12 : Math.max(8, rect.left);
					const top = rect.top;
					const classNameFull = classById.get(target.classId)?.name || target.class?.name || '';
					const raceNameFull = raceById.get(Number((target as any)?.raceId) || 0)?.name || target.race?.name || '';
					const iconUrl = asImageUrl(target.icon);
						return (
						<div
							className="card-hover-preview"
							style={{ position: 'fixed', left: rect.left, top: rect.top, width: rect.width, zIndex: 11000, transform: 'none', pointerEvents: 'auto', cursor: onOpenCharacter ? 'pointer' : 'default' }}
							onClick={() => onOpenCharacter?.(target.id)}
							onMouseEnter={() => {
								if (hideTimerRef.current) {
									window.clearTimeout(hideTimerRef.current);
									hideTimerRef.current = null;
								}
								setPreviewHovered(true);
							}}
							onMouseLeave={() => {
								setPreviewHovered(false);
								if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
								hideTimerRef.current = window.setTimeout(() => setHoverPreview(null), 120) as unknown as number;
							}}
						>
							<div style={{ display: 'flex', gap: 12, padding: 12 }}>
								<div style={{ width: 96, height: 96, flex: '0 0 96px' }}>
									<CpImage src={iconUrl} width={96} height={96} fit="cover" frameClassName="metallic-border metallic-border-square" />
								</div>
								<div style={{ minWidth: 0, flex: 1 }}>
									<div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>{target.name}</div>
									{classNameFull ? <div style={{ marginTop: 2, opacity: 0.95 }}>{classNameFull}</div> : null}
									{raceNameFull ? <div style={{ marginTop: 2, opacity: 0.95 }}>{raceNameFull}</div> : null}
									{(target.model || '').trim() ? <div style={{ marginTop: 8, opacity: 0.9 }}>Modelo: {(target.model || '').trim()}</div> : null}
								</div>
							</div>
						</div>
					);
				})() : null}

				{filtered.length === 0 ? <div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay personajes todavía.</div> : null}
			</div>

			{modalOpen ? (
				<CharacterModal
					open={modalOpen}
					initial={initial}
					existing={characters}
					classes={classes}
					races={races}
					sounds={sounds}
					onClose={() => {
						setModalOpen(false);
						setInitial(undefined);
					}}
					onSubmit={async (data) => {
						const anyData = data as any;
						const iconFile: File | null | undefined = anyData?.iconFile;
						const imageFile: File | null | undefined = anyData?.imageFile;

						let icon = (data.icon || '').trim();
						if ((anyData as any).removeIcon) {
							icon = '';
						} else if (iconFile) {
							const uploaded = await uploadCharacterIcon(iconFile);
							if (uploaded) icon = uploaded;
						}

						let image = (data as any)?.image ? String((data as any).image).trim() : '';
						if ((anyData as any).removeImage) {
							image = '';
						} else if (imageFile) {
							const uploaded = await uploadCharacterImage(imageFile);
							if (uploaded) image = uploaded;
						}

						const model = (data.model || '').trim();

						const { iconFile: _ignoredIcon, imageFile: _ignoredImage, ...rest } = anyData;
						const payload = { ...rest, icon, image, model } as { name: string; classId: number; raceId: number; icon?: string; image?: string; model?: string };

						if (initial?.id) await updateCharacter(initial.id, payload);
						else await createCharacter(payload);
						await refresh();
						setModalOpen(false);
						setInitial(undefined);
					}}
				/>
			) : null}

			<ConfirmModal
				open={confirmOpen}
				requireText="eliminar"
				message={'¿Estás seguro de que deseas eliminar este personaje?'}
				onConfirm={async () => {
					const target = pendingDelete;
					setConfirmOpen(false);
					setPendingDelete(null);
					if (!target) return;
					await deleteCharacter(target.id);
					await refresh();
				}}
				onCancel={() => {
					setConfirmOpen(false);
					setPendingDelete(null);
				}}
			/>

			{tooltip.visible ? (
				<div
					className="fixed-trunc-tooltip"
					style={{
						position: 'fixed',
						left: tooltip.x || 0,
						top: tooltip.y || 0,
						transform: 'translate(-50%, 6px)',
						zIndex: 10000,
						maxWidth: 520,
						padding: 8,
						background: '#111',
						color: '#e2d9b7',
						borderRadius: 6,
						boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
					}}
				>
					{tooltip.text}
				</div>
			) : null}
		</div>
	);
};

export default CharactersView;
