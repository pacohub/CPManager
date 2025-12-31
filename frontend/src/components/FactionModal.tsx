import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { FactionItem } from '../interfaces/faction';
import { WC3_PLAYER_COLORS } from '../js/wc3PlayerColors';
import CpImageFill from './CpImageFill';

interface Props {
	open: boolean;
	initial?: Partial<FactionItem>;
	existing: FactionItem[];
	onSubmit: (data: FormData) => void;
	onClose: () => void;
}

const toBackendUrl = (path?: string) => {
	if (!path) return undefined;
	if (path.startsWith('http') || path.startsWith('data:')) return path;
	return encodeURI(`http://localhost:4000/${path.replace(/^\/+/, '')}`);
};

function ColorSelect({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
}) {
	const [open, setOpen] = useState(false);

	const selected = useMemo(() => {
		if (!value) return null;
		return WC3_PLAYER_COLORS.find((c) => c.hex === value) ?? null;
	}, [value]);

	return (
		<label style={{ marginBottom: 8, display: 'block', position: 'relative' }}>
			{label}:
			<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
				<div
					tabIndex={0}
					role="button"
					aria-haspopup="listbox"
					aria-expanded={open}
					className="wc3-color-combobox"
					onClick={() => setOpen((v) => !v)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							setOpen((v) => !v);
						}
						if (e.key === 'Escape') setOpen(false);
					}}
				>
					<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
						{selected ? `${selected.id}. ${selected.name}` : '(Sin color)'}
					</span>
					<span
						aria-label={selected ? selected.name : 'Sin color'}
						title={selected ? selected.name : 'Sin color'}
						style={{
							width: 18,
							height: 18,
							borderRadius: 999,
							background: value || 'transparent',
							border: '1px solid rgba(0,0,0,0.35)',
							flex: '0 0 auto',
						}}
					/>
				</div>
			</div>

			{open ? (
				<div className="wc3-color-menu" role="listbox">
					<div
						role="option"
						aria-selected={!value}
						className="wc3-color-option"
						onClick={() => {
							onChange('');
							setOpen(false);
						}}
					>
						<span
							style={{
								width: 18,
								height: 18,
								borderRadius: 999,
								background: 'transparent',
								border: '1px solid rgba(255,255,255,0.25)',
								flex: '0 0 auto',
							}}
						/>
						<span>(Sin color)</span>
					</div>
					{WC3_PLAYER_COLORS.map((c) => (
						<div
							key={c.id}
							role="option"
							aria-selected={c.hex === value}
							className="wc3-color-option"
							onClick={() => {
								onChange(c.hex);
								setOpen(false);
							}}
						>
							<span
								aria-label={c.name}
								title={c.name}
								style={{
									width: 18,
									height: 18,
									borderRadius: 999,
									background: c.hex,
									border: '1px solid rgba(0,0,0,0.35)',
									flex: '0 0 auto',
								}}
							/>
							<span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
								<span style={{ opacity: 0.9 }}>{c.id}.</span>
								<span>{c.name}</span>
							</span>
						</div>
					))}
				</div>
			) : null}
		</label>
	);
}

const FactionModal: React.FC<Props> = ({ open, initial, existing, onSubmit, onClose }) => {
	const [name, setName] = useState(initial?.name || '');
	const [description, setDescription] = useState(initial?.description || '');
	const [crestImage, setCrestImage] = useState<File | null>(null);
	const [iconImage, setIconImage] = useState<File | null>(null);
	const [removeIconImage, setRemoveIconImage] = useState(false);
	const [primaryColor, setPrimaryColor] = useState(initial?.primaryColor || '');
	const [secondaryColor, setSecondaryColor] = useState(initial?.secondaryColor || '');
	const [tertiaryColor, setTertiaryColor] = useState(initial?.tertiaryColor || '');
	const [fileLink, setFileLink] = useState(initial?.file || '');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setName(initial?.name || '');
		setDescription(initial?.description || '');
		setCrestImage(null);
		setIconImage(null);
		setRemoveIconImage(false);
		setPrimaryColor(initial?.primaryColor || '');
		setSecondaryColor(initial?.secondaryColor || '');
		setTertiaryColor(initial?.tertiaryColor || '');
		setFileLink(initial?.file || '');
		setError(null);
	}, [open, initial?.id, initial?.name, initial?.description, initial?.primaryColor, initial?.secondaryColor, initial?.tertiaryColor, initial?.file]);

	useEffect(() => {
		if (!primaryColor) {
			if (secondaryColor) setSecondaryColor('');
			if (tertiaryColor) setTertiaryColor('');
			return;
		}
		if (!secondaryColor && tertiaryColor) setTertiaryColor('');
	}, [primaryColor, secondaryColor, tertiaryColor]);

	const isDuplicateName = useMemo(() => {
		const normalized = name.trim().toLowerCase();
		if (!normalized) return false;
		return existing.some((f) => (f.name || '').trim().toLowerCase() === normalized && f.id !== initial?.id);
	}, [existing, name, initial?.id]);

	if (!open) return null;

	const crestPreviewUrl = crestImage
		? URL.createObjectURL(crestImage)
		: toBackendUrl(initial?.crestImage);

	const iconPreviewUrl = iconImage
		? URL.createObjectURL(iconImage)
		: removeIconImage
			? undefined
			: toBackendUrl(initial?.iconImage);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isDuplicateName) {
			setError('Ya existe una facción con ese nombre.');
			return;
		}
		setError(null);

		const formData = new FormData();
		formData.append('name', name);
		formData.append('description', description);
		if (crestImage) formData.append('crestImage', crestImage);
		if (removeIconImage) formData.append('iconImage', '');
		else if (iconImage) formData.append('iconImage', iconImage);
		formData.append('primaryColor', primaryColor);
		formData.append('secondaryColor', secondaryColor);
		formData.append('tertiaryColor', tertiaryColor);
		formData.append('file', fileLink.trim());
		onSubmit(formData);
	};

	return (
		<div className="modal-overlay">
			<div
				className="modal-content"
				style={{
					maxWidth: 560,
					minWidth: 340,
					/* keep modal box corners visible; allow inner area to scroll */
					overflow: 'visible',
					boxSizing: 'border-box',
				}}
			>
				<button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
					<FaTimes size={18} />
				</button>
				<h2 className="modal-title" style={{ marginTop: 0 }}>
					{initial?.id ? 'Editar Facción' : 'Nueva Facción'}
				</h2>

				{/* scroll only this inner area so modal border-radius stays visible */}
				<div className="modal-body" style={{ maxHeight: '76vh', overflowY: 'auto', padding: '0 16px 16px' }}>
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
						<div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Ya existe una facción con ese nombre.</div>
					) : null}

					<textarea
						name="description"
						placeholder="Descripción"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						autoComplete="off"
					/>

					<label style={{ marginBottom: 8, display: 'block' }}>
						Escudo (imagen):
						<input
							type="file"
							accept="image/*"
							onChange={(e) => setCrestImage(e.target.files?.[0] || null)}
							style={{ display: 'block', marginTop: 4 }}
						/>
						{initial?.crestImage && !crestImage ? (
							<div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
								Ruta actual: <span style={{ wordBreak: 'break-all' }}>{initial.crestImage}</span>
							</div>
						) : null}
					</label>

					{crestPreviewUrl ? (
						<div style={{ marginBottom: 8 }}>
							<div style={{ width: '100%', height: 140, borderRadius: 8, border: '1px solid #ccc', overflow: 'hidden' }}>
								<CpImageFill alt="Escudo" src={crestPreviewUrl} />
							</div>
						</div>
					) : null}

					<label style={{ marginBottom: 8, display: 'block' }}>
						Imagen:
						<input
							type="file"
							accept="image/*"
							onChange={(e) => {
								setRemoveIconImage(false);
								setIconImage(e.target.files?.[0] || null);
							}}
							style={{ display: 'block', marginTop: 4 }}
						/>
						{initial?.iconImage && !iconImage ? (
							<div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
								Ruta actual: <span style={{ wordBreak: 'break-all' }}>{initial.iconImage}</span>
							</div>
						) : null}
						{/** removal handled by overlay button on the preview */}
					</label>

					{iconPreviewUrl ? (
						<div style={{ marginBottom: 8 }} className="preview-container">
							<div style={{ width: 140, height: 140, borderRadius: 8, border: '1px solid #ccc', overflow: 'hidden', position: 'relative' }}>
                                {initial?.id && initial?.iconImage && !iconImage ? (
											<button
												type="button"
												className="preview-remove-btn top-right"
										data-tooltip="Eliminar imagen"
										aria-label="Eliminar imagen"
										onClick={() => {
											setIconImage(null);
											setRemoveIconImage(true);
										}}
									>
								  				<FaTimes size={14} />
						</button>
								) : null}
								<CpImageFill alt="Icono" src={iconPreviewUrl} />
							</div>
							{removeIconImage ? <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6 }}>Se eliminará al guardar.</div> : null}
						</div>
					) : null}

					<ColorSelect label="Color principal" value={primaryColor} onChange={setPrimaryColor} />
					{primaryColor ? (
						<ColorSelect label="Color secundario" value={secondaryColor} onChange={setSecondaryColor} />
					) : null}
					{secondaryColor ? (
						<ColorSelect label="Color terciario" value={tertiaryColor} onChange={setTertiaryColor} />
					) : null}

					<label style={{ marginBottom: 8, display: 'block' }}>
						Archivo:
						<input
							type="url"
							placeholder="https://..."
							value={fileLink}
							onChange={(e) => setFileLink(e.target.value)}
							style={{ display: 'block', marginTop: 4 }}
						/>
						{initial?.file ? (
							<div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
								Link actual: <span style={{ wordBreak: 'break-all' }}>{initial.file}</span>
							</div>
						) : null}
					</label>

					<div className="actions">
						<button type="submit" className="confirm" disabled={isDuplicateName}>
							Confirmar
						</button>
						<button type="button" className="cancel" onClick={onClose}>
							Cancelar
						</button>
					</div>

					{error ? <div style={{ color: 'red', marginTop: 8 }}>{error}</div> : null}
					</form>
				</div>
			</div>
		</div>
	);
};

export default FactionModal;
