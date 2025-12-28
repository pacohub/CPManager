import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { AnimationItem } from '../interfaces/animation';

interface Props {
	open: boolean;
	initial?: Partial<AnimationItem>;
	existing: AnimationItem[];
	onSubmit: (data: { name: string }) => void | Promise<void>;
	onClose: () => void;
}

const AnimationModal: React.FC<Props> = ({ open, initial, existing, onSubmit, onClose }) => {
	const [name, setName] = useState(initial?.name || '');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setName(initial?.name || '');
		setError(null);
	}, [open, initial?.id, initial?.name]);

	const isDuplicateName = useMemo(() => {
		const normalized = name.trim().toLowerCase();
		if (!normalized) return false;
		return (existing || []).some((a) => (a.name || '').trim().toLowerCase() === normalized && a.id !== initial?.id);
	}, [existing, name, initial?.id]);

	if (!open) return null;

	return (
		<div className="modal-overlay">
			<div className="modal-content" style={{ maxWidth: 520, minWidth: 360 }}>
				<button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
					<FaTimes size={18} />
				</button>
				<h2 className="modal-title" style={{ marginTop: 0 }}>{initial?.id ? 'Editar Animación' : 'Nueva Animación'}</h2>

				<form
					onSubmit={async (e) => {
						e.preventDefault();
						if (isDuplicateName) {
							setError('Ya existe una animación con ese nombre.');
							return;
						}
						setError(null);
						await onSubmit({ name: name.trim() });
					}}
					autoComplete="off"
				>
					<input
						name="name"
						placeholder="Nombre"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						autoComplete="off"
						style={isDuplicateName ? { borderColor: 'red' } : {}}
					/>
					{isDuplicateName ? (
						<div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Ya existe una animación con ese nombre.</div>
					) : null}

					<div className="actions">
						<button type="submit" className="confirm" disabled={isDuplicateName}>
							{initial?.id ? 'Actualizar' : 'Crear'}
						</button>
						<button type="button" className="cancel" onClick={onClose}>
							Cancelar
						</button>
					</div>

					{error ? <div style={{ color: 'red', marginTop: 8 }}>{error}</div> : null}
				</form>
			</div>
		</div>
	);
};

export default AnimationModal;
