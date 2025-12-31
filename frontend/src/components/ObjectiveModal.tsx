import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa';
import { EventDifficulty } from '../interfaces/event';
import { MechanicItem } from '../interfaces/mechanic';
import { ObjectiveItem } from '../interfaces/objective';
import MechanicModal from './MechanicModal';
import { createMechanic } from '../js/mechanicApi';

interface Props {
	open: boolean;
	eventId: number;
	mechanics: MechanicItem[];
	onMechanicCreated?: (created: MechanicItem) => void;
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

const ObjectiveModal: React.FC<Props> = ({ open, eventId, mechanics, onMechanicCreated, initial, onSubmit, onClose }) => {
	const [localMechanics, setLocalMechanics] = useState<MechanicItem[]>(mechanics || []);
	const [mechanicModalOpen, setMechanicModalOpen] = useState(false);
	const [mechanicInitial, setMechanicInitial] = useState<Partial<MechanicItem> | undefined>(undefined);

	const isEditing = Boolean((initial as any)?.id);

	const [name, setName] = useState(initial?.name || '');
	const [description, setDescription] = useState(initial?.description || '');
	const [detailedDescription, setDetailedDescription] = useState(initial?.detailedDescription || '');
	const [difficulty, setDifficulty] = useState<EventDifficulty>((initial?.difficulty as EventDifficulty) || (isEditing ? 'NORMAL' : 'EASY'));
	const [initialValue, setInitialValue] = useState<number>(
		Number.isFinite(initial?.initialValue as any) ? Number(initial?.initialValue) : (isEditing ? 0 : 1),
	);
	const [difficultyIncrement, setDifficultyIncrement] = useState<number>(
		Number.isFinite(initial?.difficultyIncrement as any) ? Number(initial?.difficultyIncrement) : 0,
	);
	const [mechanicId, setMechanicId] = useState<number>(() => {
		const fromInitial = Number((initial as any)?.mechanicId) || Number((initial as any)?.mechanic?.id) || 0;
		return fromInitial;
	});

	const [mechTooltip, setMechTooltip] = useState<{ visible: boolean; text?: string; x?: number; y?: number }>({ visible: false });
	const [mechanicOpen, setMechanicOpen] = useState(false);

	useEffect(() => {
		if (!mechanicOpen) setMechTooltip({ visible: false });
	}, [mechanicOpen]);

	useEffect(() => {
		if (!open) return;
		setLocalMechanics(mechanics || []);
		const nextIsEditing = Boolean((initial as any)?.id);
		setName(initial?.name || '');
		setDescription(initial?.description || '');
		setDetailedDescription(initial?.detailedDescription || '');
		setDifficulty(((initial?.difficulty as EventDifficulty) || (nextIsEditing ? 'NORMAL' : 'EASY')));
		setInitialValue(Number.isFinite(initial?.initialValue as any) ? Number(initial?.initialValue) : (nextIsEditing ? 0 : 1));
		setDifficultyIncrement(Number.isFinite(initial?.difficultyIncrement as any) ? Number(initial?.difficultyIncrement) : 0);
		const fromInitial = Number((initial as any)?.mechanicId) || Number((initial as any)?.mechanic?.id) || 0;
		setMechanicId(fromInitial);
	}, [open, initial, mechanics]);

	useEffect(() => {
		if (!open) return;
		// Si no hay mecánica seleccionada, elige la primera disponible.
		if (!mechanicId && localMechanics.length > 0) setMechanicId(localMechanics[0].id);
	}, [open, mechanicId, localMechanics]);

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
						<label style={{ flex: '1 1 180px', display: 'block' }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
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

						<div style={{ flex: '1 1 180px', display: 'block' }}>
							<label style={{ display: 'block', marginBottom: 6 }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
								Mecánica:
							</label>
							<div style={{ display: 'flex', alignItems: 'stretch', gap: 8, marginTop: 4 }}>
								<div className="mechanic-select" style={{ position: 'relative', flex: '1 1 0' }}>
									<div
										className="mechanic-select-value"
										role="button"
										tabIndex={0}
										aria-haspopup="listbox"
										aria-expanded={mechanicOpen}
										onMouseDown={(e) => { e.stopPropagation(); }}
										onClick={(e) => { e.stopPropagation(); e.preventDefault(); setMechanicOpen((v) => !v); }}
										onKeyDown={(e) => {
											e.stopPropagation();
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												setMechanicOpen((v) => !v);
											}
											if (e.key === 'Escape') {
												e.stopPropagation();
												setMechanicOpen(false);
											}
										}}
										style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 8 }}
									>
										{(localMechanics.find((m) => m.id === mechanicId)?.name) || '(Sin mecánica)'}
										<span className="mechanic-select-caret">▾</span>
									</div>

									{mechanicOpen ? (
										<div className="mechanic-select-menu" role="listbox" tabIndex={-1}>
											{mechanicOptions.map((m) => (
												<div
													key={m.id}
													role="option"
													className="mechanic-option"
													aria-selected={m.id === mechanicId}
													onClick={(e) => { e.stopPropagation(); e.preventDefault(); setMechanicId(m.id); setMechanicOpen(false); setMechTooltip({ visible: false }); }}
													onMouseEnter={(e) => {
													const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
													setMechTooltip({ visible: true, text: m.description || m.name, x: rect.left + rect.width / 2, y: rect.bottom + 8 });
													}}
													onMouseMove={(e) => setMechTooltip((t) => (t.visible ? { ...t, x: e.clientX, y: e.clientY + 18 } : t))}
													onMouseLeave={() => setMechTooltip({ visible: false })}
												>
												{m.name}
												</div>
											))}
										</div>
									) : null}
								</div>
								<button
									type="button"
									className="icon option"
									title="Nueva Mecánica"
									onClick={() => {
										setMechanicInitial(undefined);
										setMechanicModalOpen(true);
									}}
									style={{ flex: '0 0 auto', minWidth: 34 }}
									disabled={mechanicOpen}
									aria-disabled={mechanicOpen}
								>
									<FaPlus size={14} />
								</button>
							</div>
						</div>
					</div>

					{mechTooltip.visible ? (
						<div className="fixed-mechanic-tooltip" style={{ left: mechTooltip.x || 0, top: mechTooltip.y || 0 }}>
							{mechTooltip.text}
						</div>
					) : null}

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
							Confirmar
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
					onMechanicCreated?.(created);
					setLocalMechanics((prev) => {
						const next = [...(prev || []), created];
						const byId = new Map<number, MechanicItem>();
						for (const m of next) byId.set(m.id, m);
						return Array.from(byId.values());
					});
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
