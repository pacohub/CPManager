import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { MechanicItem } from '../interfaces/mechanic';

interface Props {
	open: boolean;
	initial?: Partial<MechanicItem>;
	existing: MechanicItem[];
	onSubmit: (data: { name: string; description?: string }) => void;
	onClose: () => void;
}

const MechanicModal: React.FC<Props> = ({ open, initial, existing, onSubmit, onClose }) => {
	const [name, setName] = useState(initial?.name || '');
	const [description, setDescription] = useState(initial?.description || '');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setName(initial?.name || '');
		setDescription(initial?.description || '');
		setError(null);
	}, [open, initial?.id, initial?.name, initial?.description]);

	const isDuplicateName = useMemo(() => {
		const normalized = name.trim().toLowerCase();
		if (!normalized) return false;
		return existing.some((m) => (m.name || '').trim().toLowerCase() === normalized && m.id !== initial?.id);
	}, [existing, name, initial?.id]);

	if (!open) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isDuplicateName) {
			setError('Ya existe una mecánica con ese nombre.');
			return;
		}
		setError(null);
		onSubmit({ name: name.trim(), description: description });
	};

	return (
		<div className="modal-overlay">
			<div className="modal-content" style={{ maxWidth: 520, minWidth: 340 }}>
				<button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
					<FaTimes size={18} />
				</button>
				<h2 className="modal-title" style={{ marginTop: 0 }}>{initial?.id ? 'Editar Mecánica' : 'Nueva Mecánica'}</h2>

				<form onSubmit={handleSubmit} autoComplete="off">
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
						<div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Ya existe una mecánica con ese nombre.</div>
					) : null}

					<textarea
						name="description"
						placeholder="Descripción"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						autoComplete="off"
					/>

					<div className="actions">
						<button type="submit" className="confirm" disabled={isDuplicateName}>Confirmar</button>
						<button type="button" className="cancel" onClick={onClose}>Cancelar</button>
					</div>

					{error ? <div style={{ color: 'red', marginTop: 8 }}>{error}</div> : null}
				</form>
			</div>
		</div>
	);
};

export default MechanicModal;
