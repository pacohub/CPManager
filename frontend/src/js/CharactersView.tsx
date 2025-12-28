import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { FaExclamationTriangle } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import CharacterModal from '../components/CharacterModal';
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
			<div className="panel-header">
				<button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
					<FaArrowLeft size={22} color="#FFD700" />
				</button>
				<h1 style={{ margin: 0 }}>Personajes</h1>
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
					<input
						type="text"
						placeholder="Buscar personaje..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
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
							>
								{showWarning ? (
									<span
										className="campaign-warning"
										title={warningText}
										aria-label={warningText}
										onClick={(e) => e.stopPropagation()}
										onPointerDown={(e) => e.stopPropagation()}
									>
										<FaExclamationTriangle size={14} />
									</span>
								) : null}
								<div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
									<div style={{ minWidth: 0 }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
											{iconUrl ? (
												<div className="metallic-border metallic-border-square" style={{ width: 32, height: 32, minWidth: 32, backgroundImage: 'none', flex: '0 0 auto' }}>
													<img src={iconUrl} alt="" aria-hidden="true" style={{ width: 32, height: 32, objectFit: 'cover', display: 'block' }} />
												</div>
											) : null}
											<div style={{ minWidth: 0 }}>
												<div style={{ fontWeight: 800, wordBreak: 'break-word' }}>{c.name}</div>
												{className ? <div style={{ marginTop: 2, opacity: 0.9, fontSize: 13 }}>Clase: {className}</div> : null}
												{raceName ? <div style={{ marginTop: 2, opacity: 0.9, fontSize: 13 }}>Raza: {raceName}</div> : null}
										</div>
										</div>
										{(c.model || '').trim() ? <div style={{ marginTop: 6, opacity: 0.9, fontSize: 13, wordBreak: 'break-all' }}>Modelo: {(c.model || '').trim()}</div> : null}
									</div>

									<div className="mechanic-actions" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
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
		</div>
	);
};

export default CharactersView;
