import React, { useEffect, useMemo, useState } from 'react';
import { FaExclamation, FaUser, FaFlag } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa';
import { EventDifficulty, EventItem, EventType } from '../interfaces/event';
import { MapItem } from '../interfaces/map';
import MapModal from './MapModal';
import { createMap } from '../js/mapApi';

interface Props {
	open: boolean;
	initial?: Partial<EventItem>;
	fixedType?: EventType;
	maps: MapItem[];
	onClose: () => void;
	onSubmit: (data: {
		name: string;
		description?: string;
		type: EventType;
		difficulty: EventDifficulty;
		file?: string;
		mapId: number;
	}) => void | Promise<void>;
}

const EventModal: React.FC<Props> = ({ open, initial, fixedType, maps, onClose, onSubmit }) => {
	const isEditing = Boolean((initial as any)?.id);
	const initialMapId =
		(initial as any)?.mapId ??
		(initial as any)?.map?.id ??
		undefined;

	const [name, setName] = useState(initial?.name || '');
	const [description, setDescription] = useState(initial?.description || '');
	const [type, setType] = useState<EventType>(fixedType ?? ((initial?.type as EventType) || 'MISSION'));
	const [difficulty, setDifficulty] = useState<EventDifficulty>((initial?.difficulty as EventDifficulty) || (isEditing ? 'NORMAL' : 'EASY'));
	const [file, setFile] = useState(initial?.file || '');
	const [mapId, setMapId] = useState<number>(Number(initialMapId) || 0);
	const [localMaps, setLocalMaps] = useState<MapItem[]>(maps || []);
	const [mapModalOpen, setMapModalOpen] = useState(false);
	const [mapInitial, setMapInitial] = useState<Partial<MapItem> | undefined>(undefined);

	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const showDifficulty = type !== 'CINEMATIC';

	const typeLabel = (t: EventType) => {
		switch (t) {
			case 'EVENT':
				return 'Evento';
			case 'MISSION':
				return 'Misión';
			case 'SECONDARY_MISSION':
				return 'Misión secundaria';
			case 'DAILY_MISSION':
				return 'Misión diaria';
			case 'WEEKLY_MISSION':
				return 'Misión semanal';
			case 'MOBA':
				return 'MOBA';
			case 'CINEMATIC':
				return 'Cinemática';
			default:
				return String(t);
		}
	};

	const EventTypeIcon: React.FC<{ t: EventType; size?: number }> = ({ t, size = 16 }) => {
		const dailyBlue = '#1E90FF';
		const gold = '#FFD700';
		switch (t) {
			case 'SECONDARY_MISSION':
				return <FaExclamation size={size} color="#FFFFFF" />;
			case 'EVENT':
				return <FaFlag size={size} color={gold} />;
			case 'DAILY_MISSION':
				return <FaExclamation size={size} color={dailyBlue} />;
			case 'WEEKLY_MISSION':
				return (
					<span
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							border: `1px solid ${dailyBlue}`,
							borderRadius: 999,
							width: 22,
							height: 22,
							marginLeft: -3,
							marginRight: -3,
						}}
					>
						<FaExclamation size={14} color={dailyBlue} />
					</span>
				);
			case 'MISSION':
				return <FaExclamation size={size} color={gold} />;
			case 'MOBA':
				return <FaUser size={size} color={gold} />;
			case 'CINEMATIC':
				return <FaExclamation size={size} color={gold} />;
			default:
				return null;
		}
	};

	const EVENT_TYPES: EventType[] = [
		'EVENT',
		'MISSION',
		'SECONDARY_MISSION',
		'DAILY_MISSION',
		'WEEKLY_MISSION',
		'MOBA',
		'CINEMATIC',
	];

	const [typeOpen, setTypeOpen] = useState(false);

	useEffect(() => {
		if (type === 'CINEMATIC') {
			setDifficulty('NORMAL');
		}
	}, [type]);

	useEffect(() => {
		if (!open) return;
		const nextIsEditing = Boolean((initial as any)?.id);
		const nextType = fixedType ?? ((initial?.type as EventType) || 'MISSION');
		setLocalMaps(maps || []);
		setName(initial?.name || '');
		setDescription(initial?.description || '');
		setType(nextType);
		setDifficulty((initial?.difficulty as EventDifficulty) || ((nextType !== 'CINEMATIC') && !nextIsEditing ? 'EASY' : 'NORMAL'));
		setFile(initial?.file || '');
		setMapId(Number(initialMapId) || 0);
		setError(null);
		setSubmitting(false);
	}, [
		open,
		initial?.id,
		initial?.name,
		initial?.description,
		initial?.type,
		initial?.difficulty,
		initial?.file,
		initialMapId,
		fixedType,
		maps,
	]);

	useEffect(() => {
		if (!open) return;
		if (!fixedType) return;
		setType(fixedType);
	}, [open, fixedType]);

	const sortedMaps = useMemo(() => {
		return (localMaps ?? []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [localMaps]);

	if (!open) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		const trimmedName = name.trim();
		if (!trimmedName) {
			setError('Nombre es requerido');
			return;
		}
		if (!mapId) {
			setError('Debes seleccionar un mapa');
			return;
		}

		try {
			setSubmitting(true);
			await Promise.resolve(
				onSubmit({
					name: trimmedName,
					description: description.trim() || undefined,
					type,
					difficulty: showDifficulty ? difficulty : 'NORMAL',
					file: file.trim() || undefined,
					mapId,
				}),
			);
		} catch (err: any) {
			setError(String(err?.message ?? err ?? 'Error guardando evento'));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<div className="modal-overlay">
				<div className="modal-content" style={{ maxWidth: 560, minWidth: 340 }}>
					<button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
						<FaTimes size={18} />
					</button>
					<h2 className="modal-title" style={{ marginTop: 0 }}>
						{initial?.id ? 'Editar Evento' : 'Nuevo Evento'}
					</h2>

					<form onSubmit={handleSubmit} autoComplete="off">
					<input
						name="name"
						placeholder="Nombre"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						autoComplete="off"
					/>

					<textarea
						name="description"
						placeholder="Descripción"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						autoComplete="off"
					/>

					<label style={{ marginBottom: 8, display: 'block' }}>
						Tipo:
						{fixedType ? (
							<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
								<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><EventTypeIcon t={fixedType} /><span style={{ fontWeight: 700 }}>{typeLabel(fixedType)}</span></span>
							</div>
						) : (
							<div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
								<div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
									<button
										type="button"
										onClick={() => setTypeOpen((v) => !v)}
										style={{
											width: '100%',
											display: 'flex',
											alignItems: 'center',
											gap: 8,
											justifyContent: 'space-between',
											background: 'rgba(0,0,0,0.35)',
											border: '1px solid rgba(255,215,0,0.35)',
											color: '#e2d9b7',
											padding: '6px 8px',
											borderRadius: 6,
											cursor: 'pointer',
										}}
									>
										<span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '1 1 auto' }}>
											<span style={{ flex: '0 0 auto' }}><EventTypeIcon t={type} /></span>
											<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{typeLabel(type)}</span>
										</span>
										<span style={{ opacity: 0.9, flex: '0 0 auto' }}>▾</span>
									</button>

									{typeOpen ? (
										<div
											style={{
												position: 'absolute',
												top: 'calc(100% + 6px)',
												left: 0,
												right: 0,
												zIndex: 60,
												maxHeight: 260,
												overflowY: 'auto',
												background: 'rgba(0,0,0,0.92)',
												border: '1px solid rgba(255,215,0,0.35)',
												borderRadius: 8,
												padding: 6,
											}}
											role="listbox"
										>
											{EVENT_TYPES.map((et) => (
												<button
													key={et}
													type="button"
													onClick={() => {
														setType(et);
														setTypeOpen(false);
													}}
													style={{
														width: '100%',
														textAlign: 'left',
														display: 'flex',
														alignItems: 'center',
														gap: 8,
														padding: '8px 8px',
														borderRadius: 6,
														border: '1px solid rgba(255,215,0,0.12)',
														background: 'rgba(0,0,0,0.35)',
														color: '#e2d9b7',
														cursor: 'pointer',
													}}
												>
													<span style={{ width: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><EventTypeIcon t={et} /></span>
													<span>{typeLabel(et)}</span>
												</button>
											))}
										</div>
									) : null}
								</div>
							</div>
						)}
					</label>

					{showDifficulty ? (
						<label style={{ marginBottom: 8, display: 'block' }}>
							Dificultad:
							<select value={difficulty} onChange={(e) => setDifficulty(e.target.value as EventDifficulty)} style={{ display: 'block', marginTop: 4 }}>
								<option value="EASY">Fácil</option>
								<option value="NORMAL">Normal</option>
								<option value="HARD">Difícil</option>
							</select>
						</label>
					) : null}

					<label style={{ marginBottom: 8, display: 'block' }}>
						Mapa:
						<div style={{ display: 'flex', alignItems: 'stretch', gap: 8, marginTop: 4 }}>
							<select value={mapId} onChange={(e) => setMapId(Number(e.target.value))} style={{ display: 'block', width: '100%' }}>
								<option value={0}>Seleccionar...</option>
								{sortedMaps.map((m) => (
									<option key={m.id} value={m.id}>{m.name}</option>
								))}
							</select>
							<button
								type="button"
								className="icon option"
								title="Nuevo Mapa"
								onClick={() => {
									setMapInitial(undefined);
									setMapModalOpen(true);
								}}
								style={{ flex: '0 0 auto', minWidth: 34 }}
							>
								<FaPlus size={14} />
							</button>
						</div>
					</label>

					<label style={{ marginBottom: 8, display: 'block' }}>
						Archivo (link):
						<input
							type="url"
							placeholder="https://..."
							value={file}
							onChange={(e) => setFile(e.target.value)}
							style={{ display: 'block', marginTop: 4 }}
						/>
					</label>



					<div className="actions">
						<button type="submit" className="confirm" disabled={submitting}>Confirmar</button>
						<button type="button" className="cancel" onClick={onClose} disabled={submitting}>Cancelar</button>
					</div>
					{error ? <div style={{ color: 'red', marginTop: 8 }}>{error}</div> : null}
					</form>
				</div>
			</div>

			{mapModalOpen ? (
			<MapModal
				open={mapModalOpen}
				initial={mapInitial}
				existing={localMaps}
				onClose={() => {
					setMapModalOpen(false);
					setMapInitial(undefined);
				}}
				onSubmit={async (formData) => {
					const created = await createMap(formData);
					setLocalMaps((prev) => [...(prev || []), created]);
					setMapId(created.id);
					setMapModalOpen(false);
					setMapInitial(undefined);
				}}
			/>
		) : null}
		</>
	);
};

export default EventModal;

