import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import CpImage from './CpImage';
import { DefenseTypeItem } from '../interfaces/defenseType';
import { uploadDefenseTypeIcon } from '../js/defenseTypeApi';

interface Props {
	open: boolean;
	initial?: Partial<DefenseTypeItem>;
	existing: DefenseTypeItem[];
	onClose: () => void;
	onSubmit: (data: { name: string; icon?: string | null; iconFile?: File | null; removeIcon?: boolean }) => void | Promise<void>;
}

const DefenseTypeModal: React.FC<Props> = ({ open, initial, existing, onClose, onSubmit }) => {
	const [name, setName] = useState(initial?.name ?? '');
	const [icon, setIcon] = useState<string>((initial?.icon as string) || '');
	const [iconFile, setIconFile] = useState<File | null>(null);
	const [iconPreviewUrl, setIconPreviewUrl] = useState<string>('');
	const [removeIcon, setRemoveIcon] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setName(initial?.name ?? '');
		setIcon((initial?.icon as string) || '');
		setIconFile(null);
		setIconPreviewUrl('');
		setRemoveIcon(false);
		setSaving(false);
		setError(null);
	}, [open, initial?.name, initial?.icon]);

	function asImageUrl(raw?: string): string | undefined {
		const v = (raw || '').trim();
		if (!v) return undefined;
		if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
		if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
		return undefined;
	}

	const existingNames = useMemo(() => {
		const set = new Set<string>();
		for (const x of existing || []) {
			if (initial?.id && x.id === initial.id) continue;
			set.add(String(x.name || '').trim().toLowerCase());
		}
		return set;
	}, [existing, initial?.id]);

	if (!open) return null;

	return (
		<div className="modal-overlay" role="dialog" aria-modal="true">
			<div className="modal-content" style={{ width: 520, maxWidth: '94vw' }}>
					<button className="icon option" title="Cerrar" onClick={onClose} aria-label="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
					<FaTimes size={18} />
				</button>
				<h2 className="modal-title" style={{ marginTop: 0 }}>
					{initial?.id ? 'Editar Tipo de defensa' : 'Nuevo Tipo de defensa'}
				</h2>

				<form
					onSubmit={async (e) => {
						e.preventDefault();
						setError(null);
						const trimmed = name.trim();
						if (!trimmed) return setError('El nombre es requerido.');
						if (existingNames.has(trimmed.toLowerCase())) return setError('Ya existe un tipo de defensa con ese nombre.');
						try {
							setSaving(true);
							await onSubmit({ name: trimmed, icon: (icon || '').trim() || null, iconFile: iconFile, removeIcon });
						} catch (err: any) {
							setError(err?.message || 'Error guardando tipo de defensa');
						} finally {
							setSaving(false);
						}
					}}
					autoComplete="off"
				>
					<label style={{ display: 'block' }}>
						Nombre
						<input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} disabled={saving} />
					</label>

					<div style={{ marginBottom: 8 }}>
						<div style={{ fontSize: 13, marginBottom: 4, opacity: 0.9 }}>Icono (imagen)</div>
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
								<CpImage src={iconPreviewUrl || asImageUrl(icon)} width={64} height={64} fit="cover" />
							</div>
							<div style={{ minWidth: 0, flex: 1 }}>
								<input
									type="file"
									accept="image/*"
									onChange={(e) => {
										const f = e.target.files?.[0] || null;
										if (!f) {
											setIconFile(null);
											if (iconPreviewUrl) URL.revokeObjectURL(iconPreviewUrl);
											setIconPreviewUrl('');
											return;
										}
										if (!f.type.startsWith('image/')) {
											setError('El icono debe ser una imagen.');
											setIconFile(null);
											return;
										}
										const objectUrl = URL.createObjectURL(f);
										setError(null);
										setIconFile(f);
										setRemoveIcon(false);
										if (iconPreviewUrl) URL.revokeObjectURL(iconPreviewUrl);
										setIconPreviewUrl(objectUrl);
									}}
								/>
								{iconFile ? <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>Nuevo icono: {iconFile.name}</div> : null}
							</div>
						</div>
						{icon && !iconFile ? <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>Icono actual cargado.</div> : null}
						{removeIcon ? <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>Se eliminará al guardar.</div> : null}
					</div>

					{error ? <div style={{ color: '#e24444', fontSize: 13, marginTop: 10 }}>{error}</div> : null}

					<div className="actions">
						<button type="submit" className="confirm" disabled={saving}>
							{saving ? 'Guardando...' : 'Guardar'}
						</button>
						<button type="button" className="cancel" onClick={onClose} disabled={saving}>
							Cancelar
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default DefenseTypeModal;
