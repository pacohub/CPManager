import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaEdit, FaExclamationTriangle, FaPlus, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import CharacterModal from '../components/CharacterModal';
import { CharacterItem } from '../interfaces/character';
import { ClassItem } from '../interfaces/class';
import { RaceItem } from '../interfaces/race';
import { SoundItem } from '../interfaces/sound';
import { getClasses } from './classApi';
import { createCharacterInstance, deleteCharacterInstance, getCharacter, getCharacterInstances, updateCharacterInstance, uploadCharacterIcon, uploadCharacterImage } from './characterApi';
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
			const [c, inst, klasses, r, s] = await Promise.all([
				getCharacter(characterId),
				getCharacterInstances(characterId),
				getClasses(),
				getRaces(),
				getSounds(),
			]);
			setCharacter(c);
			setInstances(inst || []);
			setClasses(klasses || []);
			setRaces(r || []);
			setSounds(s || []);
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
				<div className="block-border block-border-soft" style={{ padding: 12, marginBottom: 12 }}>
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
									Modelo: <a href={normalizeLink(character.model || '')} target="_blank" rel="noreferrer" style={{ color: '#e2c044', textDecoration: 'underline' }}>{(character.model || '').trim()}</a>
								</div>
							) : null}
						</div>
					</div>
					{imageUrl ? (
						<div style={{ marginTop: 12 }}>
							<div className="block-border block-border-soft" style={{ padding: 8 }}>
								<img src={imageUrl} alt="" aria-hidden="true" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} />
							</div>
						</div>
					) : null}
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
