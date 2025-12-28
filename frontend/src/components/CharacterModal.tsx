import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { CharacterItem } from '../interfaces/character';
import { ClassItem } from '../interfaces/class';
import ClassModal from './ClassModal';
import { createClass, uploadClassIcon } from '../js/classApi';

function asImageUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

interface Props {
	open: boolean;
	initial?: Partial<CharacterItem>;
	existing: CharacterItem[];
	classes: ClassItem[];
	onSubmit: (data: { name: string; classId: number; icon?: string; iconFile?: File | null; image?: string; imageFile?: File | null; model?: string }) => void;
	onClose: () => void;
}

const CharacterModal: React.FC<Props> = ({ open, initial, existing, classes, onSubmit, onClose }) => {
	const initialImage = (initial as any)?.image;
	const [name, setName] = useState(initial?.name || '');
	const [classId, setClassId] = useState<number>(Number.isFinite(initial?.classId as any) ? Number(initial?.classId) : 0);
	const [icon, setIcon] = useState(initial?.icon || '');
	const [iconFile, setIconFile] = useState<File | null>(null);
	const [iconPreviewUrl, setIconPreviewUrl] = useState<string>('');
	const [image, setImage] = useState(initialImage || '');
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
	const [model, setModel] = useState(initial?.model || '');
	const [error, setError] = useState<string | null>(null);
	const [classesState, setClassesState] = useState<ClassItem[]>(classes || []);
	const [classModalOpen, setClassModalOpen] = useState(false);
	const iconInputRef = useRef<HTMLInputElement | null>(null);
	const imageInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (!open) return;
		setName(initial?.name || '');
		setClassId(Number.isFinite(initial?.classId as any) ? Number(initial?.classId) : 0);
		setIcon(initial?.icon || '');
		setIconFile(null);
		setIconPreviewUrl('');
		setImage(initialImage || '');
		setImageFile(null);
		setImagePreviewUrl('');
		setModel(initial?.model || '');
		setError(null);
	}, [open, initial?.id, initial?.name, initial?.classId, initial?.icon, initialImage, initial?.model]);

	useEffect(() => {
		if (!open) return;
		setClassesState(classes || []);
	}, [open, classes]);

	useEffect(() => {
		return () => {
			if (iconPreviewUrl) URL.revokeObjectURL(iconPreviewUrl);
		};
	}, [iconPreviewUrl]);

	useEffect(() => {
		return () => {
			if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
		};
	}, [imagePreviewUrl]);

	useEffect(() => {
		if (!open) return;
		if (classId > 0) return;
		const first = (classesState || [])[0];
		if (first?.id) setClassId(first.id);
	}, [open, classId, classesState]);

	const isDuplicateName = useMemo(() => {
		const normalized = name.trim().toLowerCase();
		if (!normalized) return false;
		return existing.some((c) => (c.name || '').trim().toLowerCase() === normalized && c.id !== initial?.id);
	}, [existing, name, initial?.id]);

	if (!open) return null;

	const currentIconUrl = iconPreviewUrl || asImageUrl(icon);
	const currentImageUrl = imagePreviewUrl || asImageUrl(image);

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
		if (iconPreviewUrl) URL.revokeObjectURL(iconPreviewUrl);
		setIconPreviewUrl(objectUrl);
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (!file) {
			setImageFile(null);
			if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
			setImagePreviewUrl('');
			return;
		}

		if (!file.type.startsWith('image/')) {
			setError('La imagen debe ser una imagen.');
			setImageFile(null);
			if (imageInputRef.current) imageInputRef.current.value = '';
			return;
		}

		const objectUrl = URL.createObjectURL(file);
		setError(null);
		setImageFile(file);
		if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
		setImagePreviewUrl(objectUrl);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isDuplicateName) {
			setError('Ya existe un personaje con ese nombre.');
			return;
		}
		const nextClassId = Number(classId);
		if (!Number.isFinite(nextClassId) || nextClassId <= 0) {
			setError('Selecciona una clase.');
			return;
		}
		setError(null);
		onSubmit({
			name: name.trim(),
			classId: nextClassId,
			icon,
			iconFile,
			image,
			imageFile,
			model: model.trim(),
		});
	};

	return (
		<div className="modal-overlay">
			<div className="modal-content" style={{ maxWidth: 620, minWidth: 360 }}>
				<button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
					<FaTimes size={18} />
				</button>
				<h2 className="modal-title" style={{ marginTop: 0 }}>{initial?.id ? 'Editar Personaje' : 'Nuevo Personaje'}</h2>

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
						<div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Ya existe un personaje con ese nombre.</div>
					) : null}

					<div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
						<select
							name="classId"
							value={String(classId || '')}
							onChange={(e) => setClassId(Number(e.target.value))}
							required
							style={{ flex: 1, marginBottom: 0 }}
						>
							<option value="" disabled>
								Selecciona una clase
							</option>
							{(classesState || [])
								.slice()
								.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }))
								.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name || `Clase #${c.id}`}
									</option>
								))}
						</select>
						<button
							type="button"
							className="icon option"
							title="Nueva Clase"
							aria-label="Nueva Clase"
							onClick={() => setClassModalOpen(true)}
						>
							<FaPlus size={16} />
						</button>
					</div>

					<div style={{ marginBottom: 8 }}>
						<div style={{ fontSize: 13, marginBottom: 4, opacity: 0.9 }}>Icono (imagen 64x64)</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
							<div
								className="metallic-border metallic-border-square"
								style={{ width: 64, height: 64, minWidth: 64, display: 'flex', alignItems: 'stretch', justifyContent: 'stretch', backgroundImage: 'none' }}
							>
								{currentIconUrl ? (
									<img src={currentIconUrl} alt="" aria-hidden="true" style={{ width: 64, height: 64, objectFit: 'cover', display: 'block' }} />
								) : null}
							</div>
							<div style={{ minWidth: 0, flex: 1 }}>
								<input ref={iconInputRef} type="file" accept="image/*" onChange={handleIconChange} />
								{iconFile ? <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>Nuevo icono: {iconFile.name}</div> : null}
							</div>
						</div>
						{initial?.icon && !iconFile && currentIconUrl ? <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>Icono actual cargado.</div> : null}
					</div>

					<div style={{ marginBottom: 8 }}>
						<div style={{ fontSize: 13, marginBottom: 4, opacity: 0.9 }}>Imagen (vista previa)</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
							<div
								className="metallic-border metallic-border-square"
								style={{ width: 96, height: 96, minWidth: 96, display: 'flex', alignItems: 'stretch', justifyContent: 'stretch', backgroundImage: 'none' }}
							>
								{currentImageUrl ? (
									<img src={currentImageUrl} alt="" aria-hidden="true" style={{ width: 96, height: 96, objectFit: 'cover', display: 'block' }} />
								) : null}
							</div>
							<div style={{ minWidth: 0, flex: 1 }}>
								<input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} />
								{imageFile ? <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>Nueva imagen: {imageFile.name}</div> : null}
							</div>
						</div>
						{(initial as any)?.image && !imageFile && currentImageUrl ? <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>Imagen actual cargada.</div> : null}
					</div>

					<input
						name="model"
						placeholder="Modelo (URL)"
						value={model}
						onChange={(e) => setModel(e.target.value)}
						autoComplete="off"
					/>

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

				{classModalOpen ? (
					<ClassModal
						open={classModalOpen}
						existing={classesState}
						onClose={() => setClassModalOpen(false)}
						onSubmit={async (data) => {
							const anyData = data as any;
							const iconFile: File | null | undefined = anyData?.iconFile;
							let icon = (data.icon || '').trim();
							if (iconFile) {
								const uploaded = await uploadClassIcon(iconFile);
								if (uploaded) icon = uploaded;
							}
							const { iconFile: _ignored, ...rest } = anyData;
							const payload = { ...rest, icon } as { name: string; icon?: string; description?: string; level?: number };
							const created = await createClass(payload);
							setClassesState((prev) => {
								const next = (prev || []).slice();
								next.push(created);
								return next;
							});
							setClassId(created.id);
							setClassModalOpen(false);
						}}
					/>
				) : null}
			</div>
		</div>
	);
};

export default CharacterModal;
