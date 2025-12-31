import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { ClassItem } from '../interfaces/class';
import CpImage from './CpImage';

function asImageUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

interface Props {
	open: boolean;
	initial?: Partial<ClassItem>;
	existing: ClassItem[];
	onSubmit: (data: { name: string; icon?: string; iconFile?: File | null; removeIcon?: boolean; description?: string; level?: number }) => void;
	onClose: () => void;
}

const ClassModal: React.FC<Props> = ({ open, initial, existing, onSubmit, onClose }) => {
	const [name, setName] = useState(initial?.name || '');
	const [icon, setIcon] = useState(initial?.icon || '');
	const [iconFile, setIconFile] = useState<File | null>(null);
	const [iconPreviewUrl, setIconPreviewUrl] = useState<string>('');
	const [removeIcon, setRemoveIcon] = useState(false);
	const [description, setDescription] = useState(initial?.description || '');
	const [level, setLevel] = useState<number>(Number.isFinite(initial?.level as any) ? Number(initial?.level) : 1);
	const [error, setError] = useState<string | null>(null);
	const iconInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (!open) return;
		setName(initial?.name || '');
		setIcon(initial?.icon || '');
		setIconFile(null);
		setRemoveIcon(false);
		setIconPreviewUrl('');
		setDescription(initial?.description || '');
		setLevel(Number.isFinite(initial?.level as any) ? Number(initial?.level) : 1);
		setError(null);
	}, [open, initial?.id, initial?.name, initial?.icon, initial?.description, initial?.level]);

	useEffect(() => {
		return () => {
			if (iconPreviewUrl) URL.revokeObjectURL(iconPreviewUrl);
		};
	}, [iconPreviewUrl]);

	const isDuplicateName = useMemo(() => {
		const normalized = name.trim().toLowerCase();
		if (!normalized) return false;
		return existing.some((c) => (c.name || '').trim().toLowerCase() === normalized && c.id !== initial?.id);
	}, [existing, name, initial?.id]);

	if (!open) return null;

	const currentIconUrl = iconPreviewUrl || asImageUrl(icon);

	const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (!file) {
			setIconFile(null);
			if (iconPreviewUrl) URL.revokeObjectURL(iconPreviewUrl);
			setIconPreviewUrl('');
			return;
		}

		if (!file.type.startsWith('image/')) {
			setError('El icono debe ser una imagen.');
			setIconFile(null);
			if (iconInputRef.current) iconInputRef.current.value = '';
			return;
		}

		const objectUrl = URL.createObjectURL(file);
		setError(null);
		setIconFile(file);
		setRemoveIcon(false);
		if (iconPreviewUrl) URL.revokeObjectURL(iconPreviewUrl);
		setIconPreviewUrl(objectUrl);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isDuplicateName) {
			setError('Ya existe una clase con ese nombre.');
			return;
		}
		const nextLevel = Number(level);
		if (!Number.isFinite(nextLevel) || nextLevel <= 0) {
			setError('El nivel debe ser un número mayor que 0.');
			return;
		}
		setError(null);
		onSubmit({
			name: name.trim(),
			icon,
			iconFile,
			removeIcon,
			description,
			level: nextLevel,
		});
	};

	return (
		<div className="modal-overlay">
			<div className="modal-content" style={{ maxWidth: 560, minWidth: 360 }}>
				<button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
					<FaTimes size={18} />
				</button>
				<h2 className="modal-title" style={{ marginTop: 0 }}>{initial?.id ? 'Editar Clase' : 'Nueva Clase'}</h2>

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
						<div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Ya existe una clase con ese nombre.</div>
					) : null}

					<div style={{ marginBottom: 8 }}>
						<div style={{ fontSize: 13, marginBottom: 4, opacity: 0.9 }}>Icono (imagen 64x64)</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
							<div style={{ position: 'relative' }} className="preview-container">
								{initial?.id && initial?.icon && !iconFile ? (
									<button
										type="button"
										className="preview-remove-btn top-right"
										data-tooltip="Eliminar icono"
										aria-label="Eliminar icono"
										onClick={() => {
											setIconFile(null);
											setRemoveIcon(true);
										}}
										>
											<FaTimes size={14} />
										</button>
								) : null}
								<CpImage src={currentIconUrl || undefined} width={64} height={64} fit="cover" />
							</div>
							<div style={{ minWidth: 0, flex: 1 }}>
								<input ref={iconInputRef} type="file" accept="image/*" onChange={handleIconChange} />
								{iconFile ? (
									<div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>Nuevo icono: {iconFile.name}</div>
								) : null}
							</div>
						</div>
						{initial?.icon && !iconFile && currentIconUrl ? (
							<div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>Icono actual cargado.</div>
						) : null}
						{removeIcon ? <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>Se eliminará al guardar.</div> : null}
					</div>

					<input
						name="level"
						type="number"
						min={1}
						step={1}
						placeholder="Nivel"
						value={String(level)}
						onChange={(e) => setLevel(Number(e.target.value))}
						autoComplete="off"
					/>

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

export default ClassModal;
