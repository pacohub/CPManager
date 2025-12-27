import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { EventDifficulty } from '../interfaces/event';
import { MechanicItem } from '../interfaces/mechanic';
import { ObjectiveItem } from '../interfaces/objective';
import MechanicModal from './MechanicModal';
import { createMechanic } from '../js/mechanicApi';

interface Props {
	open: boolean;
	eventId: number;
	mechanics: MechanicItem[];
	initial?: Partial<ObjectiveItem>;
	onSubmit: (data: {
		name: string;
		description?: string;
		detailedDescription?: string;
		difficulty: EventDifficulty;
		initialValue: number;
		difficultyIncrement: number;
		mechanicId: number;
	}) => void;
	onClose: () => void;
}

const ObjectiveModal: React.FC<Props> = ({ open, eventId, mechanics, initial, onSubmit, onClose }) => {
	const [localMechanics, setLocalMechanics] = useState<MechanicItem[]>(mechanics || []);
	const [mechanicModalOpen, setMechanicModalOpen] = useState(false);
	const [mechanicInitial, setMechanicInitial] = useState<Partial<MechanicItem> | undefined>(undefined);

	const [name, setName] = useState(initial?.name || '');
	const [description, setDescription] = useState(initial?.description || '');
	const [detailedDescription, setDetailedDescription] = useState(initial?.detailedDescription || '');
	const [difficulty, setDifficulty] = useState<EventDifficulty>((initial?.difficulty as EventDifficulty) || 'NORMAL');
	const [initialValue, setInitialValue] = useState<number>(Number.isFinite(initial?.initialValue as any) ? Number(initial?.initialValue) : 0);
	const [difficultyIncrement, setDifficultyIncrement] = useState<number>(
		Number.isFinite(initial?.difficultyIncrement as any) ? Number(initial?.difficultyIncrement) : 0,
	);
	const [mechanicId, setMechanicId] = useState<number>(() => {
		const fromInitial = Number((initial as any)?.mechanicId) || Number((initial as any)?.mechanic?.id) || 0;
		return fromInitial;
	});

	useEffect(() => {
		if (!open) return;
		setLocalMechanics(mechanics || []);
		setName(initial?.name || '');
		setDescription(initial?.description || '');
		setDetailedDescription(initial?.detailedDescription || '');
		setDifficulty(((initial?.difficulty as EventDifficulty) || 'NORMAL'));
		setInitialValue(Number.isFinite(initial?.initialValue as any) ? Number(initial?.initialValue) : 0);
		setDifficultyIncrement(Number.isFinite(initial?.difficultyIncrement as any) ? Number(initial?.difficultyIncrement) : 0);
		const fromInitial = Number((initial as any)?.mechanicId) || Number((initial as any)?.mechanic?.id) || 0;
		setMechanicId(fromInitial);
	}, [open, initial, mechanics]);

	useEffect(() => {
		if (!open) return;
		// Si no hay mecánica seleccionada, elige la primera disponible.
		if (!mechanicId && mechanics.length > 0) setMechanicId(mechanics[0].id);
	}, [open, mechanicId, mechanics]);

	const mechanicOptions = useMemo(
		() => (localMechanics || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })),
		[localMechanics],
	);

	if (!open) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!mechanicId) return;
		onSubmit({
			name: name.trim(),
			description,
			detailedDescription,
			difficulty,
			initialValue: Math.trunc(Number(initialValue) || 0),
			difficultyIncrement: Math.trunc(Number(difficultyIncrement) || 0),
			mechanicId,
		});
	};

	return (
		<>
			<div className="modal-overlay">
				<div className="modal-content" style={{ maxWidth: 640, minWidth: 360 }}>
					<button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
						<FaTimes size={18} />
					</button>
					<h2 className="modal-title" style={{ marginTop: 0 }}>{initial?.id ? 'Editar Objetivo' : 'Nuevo Objetivo'}</h2>

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

					<textarea
						name="detailedDescription"
						placeholder="Descripción detallada"
						value={detailedDescription}
						onChange={(e) => setDetailedDescription(e.target.value)}
						autoComplete="off"
						style={{ minHeight: 110 }}
					/>

					<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
						<label style={{ flex: '1 1 180px', display: 'block' }}>
							Dificultad:
							<select
								value={difficulty}
								onChange={(e) => setDifficulty(e.target.value as EventDifficulty)}
								style={{ display: 'block', marginTop: 4, width: '100%', padding: 8 }}
							>
								<option value="EASY">Fácil</option>
								<option value="NORMAL">Normal</option>
								<option value="HARD">Difícil</option>
							</select>
						</label>

						<label style={{ flex: '1 1 180px', display: 'block' }}>
							Mecánica:
							<div style={{ display: 'flex', alignItems: 'stretch', gap: 8, marginTop: 4 }}>
								<select
									value={mechanicId || ''}
									onChange={(e) => setMechanicId(Number(e.target.value))}
									style={{ display: 'block', width: '100%', padding: 8 }}
								>
									{mechanicOptions.map((m) => (
										<option key={m.id} value={m.id}>{m.name}</option>
									))}
								</select>
								<button
									type="button"
									className="icon option"
									title="Nueva Mecánica"
									onClick={() => {
										setMechanicInitial(undefined);
										setMechanicModalOpen(true);
									}}
									style={{ flex: '0 0 auto', minWidth: 34 }}
								>
									<FaPlus size={14} />
								</button>
							</div>
						</label>
					</div>

					<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
						<label style={{ flex: '1 1 180px', display: 'block' }}>
							Valor inicial:
							<input
								type="number"
								value={initialValue}
								onChange={(e) => setInitialValue(Number(e.target.value))}
								style={{ display: 'block', marginTop: 4, width: '100%' }}
							/>
						</label>

						<label style={{ flex: '1 1 180px', display: 'block', fontSize: 12 }}>
							<span style={{ whiteSpace: 'nowrap' }}>Aumento de dificultad +:</span>
							<input
								type="number"
								value={difficultyIncrement}
								onChange={(e) => setDifficultyIncrement(Number(e.target.value))}
								style={{ display: 'block', marginTop: 4, width: '100%' }}
							/>
						</label>
					</div>

					<div className="actions">
						<button type="submit" className="confirm" disabled={!mechanicId || !name.trim()}>
							{initial?.id ? 'Actualizar' : 'Crear'}
						</button>
						<button type="button" className="cancel" onClick={onClose}>Cancelar</button>
					</div>

					<div style={{ marginTop: 6, opacity: 0.75, fontSize: 12 }}>
						Evento: {eventId}
					</div>
					</form>
				</div>
			</div>

			{mechanicModalOpen ? (
			<MechanicModal
				open={mechanicModalOpen}
				initial={mechanicInitial}
				existing={localMechanics}
				onClose={() => {
					setMechanicModalOpen(false);
					setMechanicInitial(undefined);
				}}
				onSubmit={async (data) => {
					const created = await createMechanic(data);
					setLocalMechanics((prev) => [...(prev || []), created]);
					setMechanicId(created.id);
					setMechanicModalOpen(false);
					setMechanicInitial(undefined);
				}}
			/>
		) : null}
		</>
	);
};

export default ObjectiveModal;
