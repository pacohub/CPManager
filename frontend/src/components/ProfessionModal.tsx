import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { ProfessionItem } from '../interfaces/profession';

interface Props {
	open: boolean;
	initial?: Partial<ProfessionItem>;
	existing: ProfessionItem[];
	onSubmit: (data: { name: string; description?: string; link?: string }) => void;
	onClose: () => void;
}

const ProfessionModal: React.FC<Props> = ({ open, initial, existing, onSubmit, onClose }) => {
	const [name, setName] = useState(initial?.name || '');
	const [description, setDescription] = useState(initial?.description || '');
	const [link, setLink] = useState(initial?.link || '');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setName(initial?.name || '');
		setDescription(initial?.description || '');
		setLink(initial?.link || '');
		setError(null);
	}, [open, initial?.id, initial?.name, initial?.description, initial?.link]);

	const isDuplicateName = useMemo(() => {
		const normalized = name.trim().toLowerCase();
		if (!normalized) return false;
		return existing.some((p) => (p.name || '').trim().toLowerCase() === normalized && p.id !== initial?.id);
	}, [existing, name, initial?.id]);

	if (!open) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isDuplicateName) {
			setError('Ya existe una profesión con ese nombre.');
			return;
		}
		setError(null);
		onSubmit({ name: name.trim(), description: description, link: link });
	};

	return (
		<div className="modal-overlay">
			<div className="modal-content" style={{ maxWidth: 520, minWidth: 340 }}>
				<button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
					<FaTimes size={18} />
				</button>
				<h2 className="modal-title" style={{ marginTop: 0 }}>{initial?.id ? 'Editar Profesión' : 'Nueva Profesión'}</h2>

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
						<div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Ya existe una profesión con ese nombre.</div>
					) : null}

					<textarea
						name="description"
						placeholder="Descripción"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						autoComplete="off"
					/>

					<input
						name="link"
						placeholder="Link"
						value={link}
						onChange={(e) => setLink(e.target.value)}
						autoComplete="off"
					/>

					<div className="actions">
						<button type="submit" className="confirm" disabled={isDuplicateName}>{initial?.id ? 'Actualizar' : 'Crear'}</button>
						<button type="button" className="cancel" onClick={onClose}>Cancelar</button>
					</div>

					{error ? <div style={{ color: 'red', marginTop: 8 }}>{error}</div> : null}
				</form>
			</div>
		</div>
	);
};

export default ProfessionModal;
