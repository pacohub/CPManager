import React, { useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { FaTimes, FaTrash } from 'react-icons/fa';
import NameModal from './NameModal';
import { SoundItem } from '../interfaces/sound';
import { SoundTypeItem } from '../interfaces/soundType';
import ConfirmModal from './ConfirmModal';
import { getSounds } from '../js/soundApi';

interface Props {
	open: boolean;
	initial?: Partial<SoundItem>;
	existing: SoundItem[];
	types: SoundTypeItem[];
	onClose: () => void;
	onCreateType?: (name: string) => Promise<void>;
	onDeleteType?: (id: number) => Promise<void>;
	onSubmit: (data: { name: string; typeIds: number[]; file?: File | null; removeFile?: boolean }) => void | Promise<void>;
}

const SoundModal: React.FC<Props> = ({ open, initial, existing, types, onClose, onCreateType, onDeleteType, onSubmit }) => {
	const [name, setName] = useState(initial?.name ?? '');
	const [typeIds, setTypeIds] = useState<number[]>(() => (initial?.types || []).map((t) => t.id));
	const [file, setFile] = useState<File | null>(null);
	const [removeFile, setRemoveFile] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [createTypeOpen, setCreateTypeOpen] = useState(false);
	const [createTypeError, setCreateTypeError] = useState<string | null>(null);

	const [hoveredTypeId, setHoveredTypeId] = useState<number | null>(null);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const [pendingDeleteTypeId, setPendingDeleteTypeId] = useState<number | null>(null);
	const [pendingDeleteTypeUsageCount, setPendingDeleteTypeUsageCount] = useState<number | null>(null);

	const existingNames = useMemo(() => new Set((existing || []).filter((x) => x.id !== initial?.id).map((x) => (x.name || '').trim().toLowerCase())), [existing, initial?.id]);

	if (!open) return null;

	return (
		<div className="modal-overlay" role="dialog" aria-modal="true">
			<div className="modal-content" style={{ width: 640, maxWidth: '92vw' }}>
					<button className="icon option" title="Cerrar" onClick={onClose} aria-label="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
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
							await onSubmit({ name: trimmed, typeIds, file, removeFile });
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
										<div
											key={t.id}
											onMouseEnter={() => setHoveredTypeId(t.id)}
											onMouseLeave={() => setHoveredTypeId((prev) => (prev === t.id ? null : prev))}
											style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
										>
											<label style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
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
											{typeof (onDeleteType) === 'function' ? (
												<button
													type="button"
													className="icon option"
													title="Eliminar tipo"
													style={{ visibility: hoveredTypeId === t.id ? 'visible' : 'hidden' }}
													onClick={async () => {
														setPendingDeleteTypeId(t.id);
														// check usage
														try {
															const sounds = await getSounds();
															const count = (sounds || []).filter((s) => (s.types || []).some((tt) => tt.id === t.id)).length;
															setPendingDeleteTypeUsageCount(count);
														} catch (err) {
															setPendingDeleteTypeUsageCount(null);
														}
														setConfirmDeleteOpen(true);
													}}
												>
													<FaTrash size={14} />
												</button>
											) : null}
										</div>
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
					{initial?.id && initial?.file && !file ? (
						<div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
							<button
								type="button"
								className="icon option"
								onClick={() => {
									setFile(null);
									setRemoveFile(true);
								}}
								data-tooltip="Eliminar archivo"
								aria-label="Eliminar archivo"
								style={{ padding: '2px 8px' }}
							>
								Eliminar archivo
							</button>
							{removeFile ? <span style={{ fontSize: 12, opacity: 0.9 }}>Se eliminará al guardar.</span> : null}
						</div>
					) : null}

					{error ? <div style={{ color: '#e24444', fontSize: 13 }}>{error}</div> : null}

					<div className="actions">
						<button type="submit" className="confirm" disabled={saving}>{saving ? 'Confirmando...' : 'Confirmar'}</button>
						<button type="button" className="cancel" onClick={onClose} disabled={saving}>Cancelar</button>
					</div>
				</form>
			</div>

			<NameModal
				open={createTypeOpen}
				title="Nuevo tipo de sonido"
				confirmText="Confirmar"
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

			<ConfirmModal
				open={confirmDeleteOpen}
				requireText="eliminar"
				message={
					pendingDeleteTypeId
						? (
							(() => {
								const name = types.find((x) => x.id === pendingDeleteTypeId)?.name || '';
								if (pendingDeleteTypeUsageCount && pendingDeleteTypeUsageCount > 0) {
									return (
										<div>
											<p>¿Eliminar el tipo "{name}"?</p>
											<p style={{ color: '#e2a03a', fontWeight: 700 }}>ADVERTENCIA: Este tipo está en uso por {pendingDeleteTypeUsageCount} sonido(s). Al confirmar se eliminarán las asociaciones y se borrará el tipo.</p>
										</div>
									);
								}
								return `¿Eliminar el tipo "${name}"?`;
							})()
						)
					: '¿Eliminar el tipo?'
				}
				onConfirm={async () => {
					if (!pendingDeleteTypeId || !onDeleteType) {
						setConfirmDeleteOpen(false);
						setPendingDeleteTypeId(null);
						return;
					}
					try {
						await onDeleteType(pendingDeleteTypeId);
						setTypeIds((prev) => prev.filter((x) => x !== pendingDeleteTypeId));
						setError(null);
					} catch (err: any) {
						setError(err?.message || 'No se pudo eliminar el tipo.');
					} finally {
						setConfirmDeleteOpen(false);
						setPendingDeleteTypeId(null);
					}
				}}
				onCancel={() => {
					setConfirmDeleteOpen(false);
					setPendingDeleteTypeId(null);
				}}
			/>
		</div>
	);
};

export default SoundModal;
