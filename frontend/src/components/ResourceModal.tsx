import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa';
import NameModal from './NameModal';
import CpImage from './CpImage';
import { ResourceItem } from '../interfaces/resource';
import { ResourceTypeItem } from '../interfaces/resourceType';

function asImageUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

interface Props {
	open: boolean;
	initial?: Partial<ResourceItem>;
	existing: ResourceItem[];
	resourceTypes: ResourceTypeItem[];
	onCreateType: (name: string) => Promise<ResourceTypeItem | null>;
	onSubmit: (data: { name: string; description?: string; fileLink?: string; resourceTypeId: number; iconFile?: File | null; removeIcon?: boolean }) => void;
	onClose: () => void;
}

const ResourceModal: React.FC<Props> = ({ open, initial, existing, resourceTypes, onCreateType, onSubmit, onClose }) => {
	const [name, setName] = useState(initial?.name || '');
	const [description, setDescription] = useState(initial?.description || '');
	const initialTypeId = useMemo(() => Number((initial as any)?.resourceType?.id) || '', [initial]);
	const initialFileLink = useMemo(() => String((initial as any)?.fileLink ?? ''), [initial]);
	const [fileLink, setFileLink] = useState(initialFileLink);
	const [resourceTypeId, setResourceTypeId] = useState<number | ''>(initialTypeId);
	const [iconFile, setIconFile] = useState<File | null>(null);
	const [iconPreviewUrl, setIconPreviewUrl] = useState<string>('');
	const [removeIcon, setRemoveIcon] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [createTypeModalOpen, setCreateTypeModalOpen] = useState(false);
	const [createTypeError, setCreateTypeError] = useState<string | null>(null);
	const iconInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (!open) return;
		setName(initial?.name || '');
		setDescription(initial?.description || '');
		setFileLink(initialFileLink);
		setResourceTypeId(initialTypeId);
		setIconFile(null);
		setIconPreviewUrl('');
		setRemoveIcon(false);
		setError(null);
		setCreateTypeModalOpen(false);
		setCreateTypeError(null);
	}, [open, initial?.id, initial?.name, initial?.description, initialTypeId, initialFileLink]);

	useEffect(() => {
		return () => {
			if (iconPreviewUrl) URL.revokeObjectURL(iconPreviewUrl);
		};
	}, [iconPreviewUrl]);

	const isDuplicateName = useMemo(() => {
		const normalized = name.trim().toLowerCase();
		if (!normalized) return false;
		return (existing || []).some((r) => (r.name || '').trim().toLowerCase() === normalized && r.id !== initial?.id);
	}, [existing, name, initial?.id]);

	const currentIconUrl = removeIcon ? null : (iconPreviewUrl || asImageUrl(initial?.icon));

	if (!open) return null;

	const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (!file) {
			setIconFile(null);
			if (iconPreviewUrl) URL.revokeObjectURL(iconPreviewUrl);
			setIconPreviewUrl('');
			setRemoveIcon(false);
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
		setRemoveIcon(false);
	};

	const handleCreateType = async (typeName: string) => {
		setCreateTypeError(null);
		try {
			const created = await onCreateType(typeName);
			if (created?.id) setResourceTypeId(created.id);
			setCreateTypeModalOpen(false);
		} catch (e) {
			setCreateTypeError(String(e));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isDuplicateName) {
			setError('Ya existe un recurso con ese nombre.');
			return;
		}
		if (!resourceTypeId) {
			setError('Selecciona un tipo de recursos.');
			return;
		}
		setError(null);
		onSubmit({
			name: name.trim(),
			description: description,
			fileLink: fileLink,
			resourceTypeId: Number(resourceTypeId),
			iconFile,
			removeIcon,
		});
	};

	const sortedTypes = (resourceTypes || [])
		.slice()
		.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));

	return (
		<div className="modal-overlay">
			<div className="modal-content" style={{ maxWidth: 560, minWidth: 360 }}>
				<button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
					<FaTimes size={18} />
				</button>
				<h2 className="modal-title" style={{ marginTop: 0 }}>{initial?.id ? 'Editar Recurso' : 'Nuevo Recurso'}</h2>

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
						<div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Ya existe un recurso con ese nombre.</div>
					) : null}

					<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
						<select
							value={resourceTypeId}
							onChange={(e) => setResourceTypeId(e.target.value ? Number(e.target.value) : '')}
							required
							style={{ flex: 1, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,215,0,0.35)', color: '#e2d9b7' }}
						>
							<option value="">Tipo de recursos…</option>
							{sortedTypes.map((t) => (
								<option key={t.id} value={t.id}>{t.name}</option>
							))}
						</select>
						<button type="button" className="icon option" title="Nuevo tipo" onClick={() => {
							setCreateTypeModalOpen(true);
							setCreateTypeError(null);
						}}>
							<FaPlus size={14} />
						</button>
					</div>

					<div style={{ marginBottom: 8 }}>
						<input
							name="fileLink"
							placeholder="Link a archivo (opcional)"
							value={fileLink}
							onChange={(e) => setFileLink(e.target.value)}
							autoComplete="off"
						/>
						<div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>Pega una URL (por ejemplo Drive/Dropbox) o una ruta pública.</div>
					</div>

					<div style={{ marginBottom: 8 }}>
						<div style={{ fontSize: 13, marginBottom: 4, opacity: 0.9 }}>Icono (imagen)</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
							<div style={{ position: 'relative' }} className="preview-container">
								{initial?.id && initial?.icon && !iconFile && !removeIcon ? (
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
						{removeIcon ? <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>Se eliminará al guardar.</div> : null}
						{initial?.icon && !iconFile && currentIconUrl ? (
							<div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>Icono actual cargado.</div>
						) : null}
					</div>

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

			<NameModal
				open={createTypeModalOpen}
				title="Nuevo tipo de recurso"
				confirmText="Confirmar"
				placeholder="Nombre del tipo"
				helperText="Ejemplos: “Piedra”, “Madera”, “Oro”."
				errorText={createTypeError}
				onCancel={() => {
					setCreateTypeModalOpen(false);
					setCreateTypeError(null);
				}}
				onConfirm={handleCreateType}
			/>
		</div>
	);
};

export default ResourceModal;
