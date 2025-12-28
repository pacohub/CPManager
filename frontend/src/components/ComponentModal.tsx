import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { COMPONENT_TYPES, ComponentItem } from '../interfaces/component';

function asImageUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

interface Props {
	open: boolean;
	initial?: Partial<ComponentItem>;
	existing: ComponentItem[];
	onSubmit: (data: FormData) => void;
	onClose: () => void;
}

const ComponentModal: React.FC<Props> = ({ open, initial, existing, onSubmit, onClose }) => {
	const [name, setName] = useState(initial?.name || '');
	const [description, setDescription] = useState(initial?.description || '');
	const [type, setType] = useState<string>(initial?.type || COMPONENT_TYPES[0]);
	const [model, setModel] = useState(initial?.model || '');
	const [image, setImage] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setName(initial?.name || '');
		setDescription(initial?.description || '');
		setType((initial?.type as string) || COMPONENT_TYPES[0]);
		setModel(initial?.model || '');
		setImage(null);
		setError(null);
	}, [open, initial?.id, initial?.name, initial?.description, initial?.type, initial?.model]);

	const isDuplicateName = useMemo(() => {
		const normalized = name.trim().toLowerCase();
		if (!normalized) return false;
		return existing.some((c) => (c.name || '').trim().toLowerCase() === normalized && c.id !== initial?.id);
	}, [existing, name, initial?.id]);

	if (!open) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isDuplicateName) {
			setError('Ya existe un componente con ese nombre.');
			return;
		}
		setError(null);

		const formData = new FormData();
		formData.append('name', name.trim());
		formData.append('type', type);
		formData.append('description', description);
		formData.append('model', model);
		if (image) formData.append('image', image);
		onSubmit(formData);
	};

	const previewUrl = image
		? URL.createObjectURL(image)
		: initial?.image
			? asImageUrl(initial.image)
			: null;

	return (
		<div className="modal-overlay">
			<div className="modal-content" style={{ maxWidth: 600, minWidth: 380 }}>
				<button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
					<FaTimes size={18} />
				</button>
				<h2 className="modal-title" style={{ marginTop: 0 }}>{initial?.id ? 'Editar Componente' : 'Nuevo Componente'}</h2>

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
						<div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Ya existe un componente con ese nombre.</div>
					) : null}

					<select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 8 }}>
						{COMPONENT_TYPES.map((t) => (
							<option key={t} value={t}>{t}</option>
						))}
					</select>

					<textarea
						name="description"
						placeholder="Descripción"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						autoComplete="off"
					/>

					<label style={{ marginBottom: 8, display: 'block' }}>
						Imagen:
						<input
							type="file"
							accept="image/*"
							onChange={(e) => setImage(e.target.files?.[0] || null)}
							style={{ display: 'block', marginTop: 4 }}
						/>
						{initial?.image && !image ? (
							<div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
								Ruta actual: <span style={{ wordBreak: 'break-all' }}>{initial.image}</span>
							</div>
						) : null}
					</label>

					{previewUrl ? (
						<div style={{ marginBottom: 8 }}>
							<img
								src={previewUrl}
								alt="Previsualización"
								style={{ maxWidth: '100%', maxHeight: 140, border: '1px solid #ccc' }}
							/>
						</div>
					) : null}

					<input
						name="model"
						placeholder="Modelo (link)"
						value={model}
						onChange={(e) => setModel(e.target.value)}
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

export default ComponentModal;
