import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { CharacterItem } from '../interfaces/character';
import { DialogueLine, EventItem } from '../interfaces/event';

interface Props {
	open: boolean;
	event: EventItem;
	characters: CharacterItem[];
	mode: 'add' | 'edit';
	initialLine?: DialogueLine;
	onClose: () => void;
	onSubmit: (data: { line: DialogueLine }) => void | Promise<void>;
}

const DialogueModal: React.FC<Props> = ({ open, event, characters, mode, initialLine, onClose, onSubmit }) => {
	const computedInitial = useMemo(() => {
		const src = initialLine || ({} as any);
		const speakerRaw = String((src as any)?.speaker ?? '').trim();
		const text = String((src as any)?.text ?? '');

		// Keep compatibility with existing data:
		// - If speaker is a numeric id, keep it.
		// - If speaker is a name, keep it.
		// - If speaker is a name that matches a character, map to its id so the select can preselect.
		let speaker = speakerRaw;
		if (speakerRaw) {
			const asId = Number(speakerRaw);
			const hasId = Number.isFinite(asId) && characters.some((c) => c.id === asId);
			if (!hasId) {
				const foundByName = characters.find((c) => (c.name || '').trim().toLowerCase() === speakerRaw.toLowerCase());
				if (foundByName) speaker = String(foundByName.id);
			}
		}

		return { speaker, text };
	}, [initialLine, characters]);

	const [speaker, setSpeaker] = useState('');
	const [text, setText] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const characterOptions = useMemo(() => {
		return (characters || [])
			.slice()
			.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [characters]);

	useEffect(() => {
		if (!open) return;
		setSpeaker(mode === 'edit' ? computedInitial.speaker : '');
		setText(mode === 'edit' ? computedInitial.text : '');
		setError(null);
		setSubmitting(false);
	}, [open, mode, computedInitial.speaker, computedInitial.text]);

	if (!open) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		const normalizedText = String(text ?? '').trim();
		const normalizedSpeaker = String(speaker ?? '').trim();
		if (!normalizedSpeaker) {
			setError('El speaker es obligatorio.');
			return;
		}
		if (!normalizedText) {
			setError('El texto de la línea es obligatorio.');
			return;
		}
		if (!characterOptions.length) {
			setError('No hay personajes disponibles para seleccionar como speaker.');
			return;
		}

		try {
			setSubmitting(true);
			await Promise.resolve(
				onSubmit({
					line: {
						speaker: normalizedSpeaker ? normalizedSpeaker : undefined,
						text: normalizedText,
					},
				}),
			);
		} catch (err: any) {
			setError(String(err?.message ?? err ?? 'Error guardando diálogo'));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="modal-overlay">
			<div className="modal-content" style={{ maxWidth: 720, minWidth: 360 }}>
				<button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
					<FaTimes size={18} />
				</button>

				<h2 className="modal-title" style={{ marginTop: 0 }}>
					{mode === 'edit' ? 'Editar línea de diálogo' : 'Añadir línea de diálogo'}
				</h2>

				<div style={{ marginTop: -6, opacity: 0.9, marginBottom: 10 }}>
					Evento: <span style={{ fontWeight: 700 }}>{event?.name}</span>
				</div>

				<form onSubmit={handleSubmit} autoComplete="off">
					<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
						<select
							value={speaker}
							onChange={(e) => setSpeaker(e.target.value)}
							style={{ width: '100%' }}
							disabled={!characterOptions.length}
						>
							<option value="">Speaker</option>
							{(() => {
								const trimmed = String(speaker || '').trim();
								if (!trimmed) return null;
								const asId = Number(trimmed);
								const existsById = Number.isFinite(asId) && characterOptions.some((c) => c.id === asId);
								const existsByName = characterOptions.some((c) => (c.name || '').trim().toLowerCase() === trimmed.toLowerCase());
								if (existsById || existsByName) return null;
								return (
									<option value={trimmed}>
										{trimmed} (actual)
									</option>
								);
							})()}
							{characterOptions.map((c) => (
								<option key={c.id} value={String(c.id)}>
									{c.name}
								</option>
							))}
						</select>
						<textarea
							placeholder="Texto"
							value={text}
							onChange={(e) => setText(e.target.value)}
							autoComplete="off"
							style={{ width: '100%', minHeight: 110 }}
						/>
					</div>

					<div className="actions" style={{ marginTop: 12 }}>
						<button type="submit" className="confirm" disabled={submitting}>
							Confirmar
						</button>
						<button type="button" className="cancel" onClick={onClose} disabled={submitting}>
							Cancelar
						</button>
					</div>

					{error ? <div style={{ color: 'red', marginTop: 8 }}>{error}</div> : null}
				</form>
			</div>
		</div>
	);
};

export default DialogueModal;
