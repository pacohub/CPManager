import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
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

	const showDifficulty = type === 'MISSION' || type === 'MOBA';

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
		setDifficulty((initial?.difficulty as EventDifficulty) || ((nextType === 'MISSION' || nextType === 'MOBA') && !nextIsEditing ? 'EASY' : 'NORMAL'));
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
						<select
							value={type}
							onChange={(e) => setType(e.target.value as EventType)}
							disabled={Boolean(fixedType)}
							style={{ display: 'block', marginTop: 4 }}
						>
							{fixedType ? (
								<option value={fixedType}>{fixedType === 'MISSION' ? 'Misión' : fixedType === 'MOBA' ? 'MOBA' : 'Cinemática'}</option>
							) : (
								<>
									<option value="MISSION">Misión</option>
									<option value="MOBA">MOBA</option>
									<option value="CINEMATIC">Cinemática</option>
								</>
							)}
						</select>
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
						<button type="submit" className="confirm" disabled={submitting}>{initial?.id ? 'Actualizar' : 'Crear'}</button>
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

