import React, { useMemo, useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import NameModal from './NameModal';
import { SoundItem } from '../interfaces/sound';
import { SoundTypeItem } from '../interfaces/soundType';

interface Props {
	open: boolean;
	initial?: Partial<SoundItem>;
	existing: SoundItem[];
	types: SoundTypeItem[];
	onClose: () => void;
	onCreateType?: (name: string) => Promise<void>;
	onSubmit: (data: { name: string; typeIds: number[]; file?: File | null }) => void | Promise<void>;
}

const SoundModal: React.FC<Props> = ({ open, initial, existing, types, onClose, onCreateType, onSubmit }) => {
	const [name, setName] = useState(initial?.name ?? '');
	const [typeIds, setTypeIds] = useState<number[]>(() => (initial?.types || []).map((t) => t.id));
	const [file, setFile] = useState<File | null>(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [createTypeOpen, setCreateTypeOpen] = useState(false);
	const [createTypeError, setCreateTypeError] = useState<string | null>(null);

	const existingNames = useMemo(() => new Set((existing || []).filter((x) => x.id !== initial?.id).map((x) => (x.name || '').trim().toLowerCase())), [existing, initial?.id]);

	if (!open) return null;

	return (
		<div className="modal-overlay" role="dialog" aria-modal="true">
			<div className="modal-content" style={{ width: 640, maxWidth: '92vw' }}>
				<button className="icon option" title="Cerrar" onClick={onClose} aria-label="Cerrar">
					<FaTimes size={18} />
				</button>
				<h2 style={{ marginTop: 0 }}>{initial?.id ? 'Editar Sonido' : 'Nuevo Sonido'}</h2>

				<form
					onSubmit={async (e) => {
						e.preventDefault();
						setError(null);
						const trimmed = name.trim();
						if (!trimmed) return setError('El nombre es requerido.');
						if (existingNames.has(trimmed.toLowerCase())) return setError('Ya existe un sonido con ese nombre.');
							if ((typeIds || []).length === 0) return setError('Debes seleccionar al menos un tipo.');
						try {
							setSaving(true);
							await onSubmit({ name: trimmed, typeIds, file });
						} catch (err: any) {
							setError(err?.message || 'Error guardando sonido');
						} finally {
							setSaving(false);
						}
					}}
				>
					<label>
						Nombre
						<input value={name} onChange={(e) => setName(e.target.value)} maxLength={140} />
					</label>

					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
						<div style={{ fontWeight: 800 }}>Tipos</div>
						{onCreateType ? (
							<button
								type="button"
								className="icon option"
								title="Añadir tipo"
								onClick={() => {
									setCreateTypeError(null);
									setCreateTypeOpen(true);
								}}
							>
								<FaPlus size={16} />
							</button>
						) : null}
					</div>

					<div className="block-border block-border-soft scroll-hidden" style={{ padding: 10, maxHeight: 200, overflowY: 'auto' }}>
						{(types || []).length === 0 ? (
							<div style={{ opacity: 0.85, fontSize: 13 }}>No hay tipos todavía.</div>
						) : (
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
								{types.map((t) => {
									const checked = typeIds.includes(t.id);
									return (
										<label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
											<input
												type="checkbox"
												checked={checked}
												onChange={(e) => {
													if (e.target.checked) setTypeIds((prev) => Array.from(new Set([...prev, t.id])));
													else setTypeIds((prev) => prev.filter((x) => x !== t.id));
												}}
											/>
											<span>{t.name}</span>
										</label>
									);
								})}
							</div>
						)}
					</div>

					<label>
						Archivo de sonido
						<input
							type="file"
							accept="audio/*"
							onChange={(e) => setFile(e.target.files?.[0] || null)}
						/>
						{initial?.file ? (
							<div style={{ marginTop: 6, opacity: 0.85, fontSize: 12, wordBreak: 'break-all' }}>Actual: {initial.file}</div>
						) : null}
					</label>

					{error ? <div style={{ color: '#e24444', fontSize: 13 }}>{error}</div> : null}

					<div className="actions">
						<button type="submit" className="confirm" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
						<button type="button" className="cancel" onClick={onClose} disabled={saving}>Cancelar</button>
					</div>
				</form>
			</div>

			<NameModal
				open={createTypeOpen}
				title="Nuevo tipo de sonido"
				confirmText="Crear"
				placeholder="Nombre del tipo"
				helperText="Ejemplo: “Sonido de movimiento”."
				errorText={createTypeError}
				onCancel={() => {
					setCreateTypeOpen(false);
					setCreateTypeError(null);
				}}
				onConfirm={async (typeName) => {
					if (!onCreateType) return;
					try {
						await onCreateType(typeName);
						setCreateTypeOpen(false);
						setCreateTypeError(null);
					} catch (e: any) {
						setCreateTypeError(e?.message || 'No se pudo crear el tipo.');
					}
				}}
			/>
		</div>
	);
};

export default SoundModal;
