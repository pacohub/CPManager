import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { RaceItem } from '../interfaces/race';
import { SoundItem } from '../interfaces/sound';
import { ArmorTypeItem } from '../interfaces/armorType';
import { getArmorTypes } from '../js/armorTypeApi';
import CpImage from './CpImage';

function asImageUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

const DEATH_TYPES = ['no revive, no se pudre', 'revive, no se pudre', 'revive, se pudre', 'no revive, se pudre'] as const;
const MOVEMENT_TYPES = ['ninguno', 'a pie', 'jinete', 'vuela', 'levita', 'flota', 'anfibio'] as const;

function capitalizeFirst(raw: string): string {
	const v = (raw || '').trim();
	if (!v) return '';
	return v.charAt(0).toUpperCase() + v.slice(1);
}

interface Props {
	open: boolean;
	initial?: Partial<RaceItem>;
	existing: RaceItem[];
	sounds: SoundItem[];
	onClose: () => void;
	onSubmit: (data: Partial<RaceItem> & { iconFile?: File | null; removeIcon?: boolean }) => void | Promise<void>;
}

const RaceModal: React.FC<Props> = ({ open, initial, existing, sounds, onClose, onSubmit }) => {
	const [name, setName] = useState(initial?.name ?? '');
	const [deathType, setDeathType] = useState((initial?.deathType || DEATH_TYPES[0]) as string);
	const [movementType, setMovementType] = useState((initial?.movementType || MOVEMENT_TYPES[0]) as string);
	const [armorTypes, setArmorTypes] = useState<ArmorTypeItem[]>([]);
	const [loadingArmorTypes, setLoadingArmorTypes] = useState(false);
	const [armorTypesError, setArmorTypesError] = useState<string | null>(null);
	const [armorTypeId, setArmorTypeId] = useState<number | null>(
		(initial?.armorTypeId ?? initial?.armorTypeEntity?.id ?? null) as number | null
	);
	const [baseDefense, setBaseDefense] = useState<number>(Number(initial?.baseDefense ?? 0));
	const [movementSpeed, setMovementSpeed] = useState<number>(Number(initial?.movementSpeed ?? 0));
	const [movementSoundId, setMovementSoundId] = useState<number | null>(initial?.movementSoundId ?? null);
	const [baseLife, setBaseLife] = useState<number>(Number(initial?.baseLife ?? 0));
	const [lifeRegen, setLifeRegen] = useState<number>(Number(initial?.lifeRegen ?? 0));
	const [baseMana, setBaseMana] = useState<number>(Number(initial?.baseMana ?? 0));
	const [baseManaRegen, setBaseManaRegen] = useState<number>(Number(initial?.baseManaRegen ?? 0));
	const [initialMana, setInitialMana] = useState<number>(Number(initial?.initialMana ?? 0));
	const [transportSize, setTransportSize] = useState<number>(Number(initial?.transportSize ?? 0));
	const [icon] = useState(initial?.icon ?? '');
	const [iconFile, setIconFile] = useState<File | null>(null);
	const [removeIcon, setRemoveIcon] = useState(false);
	const [iconObjectUrl, setIconObjectUrl] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		let cancelled = false;
		setArmorTypesError(null);
		setLoadingArmorTypes(true);
		getArmorTypes()
			.then((list) => {
				if (cancelled) return;
				setArmorTypes(list || []);
			})
			.catch((e: any) => {
				if (cancelled) return;
				setArmorTypes([]);
				setArmorTypesError(e?.message || 'No se pudieron cargar los tipos de armadura.');
			})
			.finally(() => {
				if (cancelled) return;
				setLoadingArmorTypes(false);
			});
		return () => {
			cancelled = true;
		};
	}, [open]);

	useEffect(() => {
		if (!open) return;
		if (armorTypeId != null) return;
		if ((armorTypes || []).length === 0) return;
		const legacyName = String(initial?.armorType || '').trim().toLowerCase();
		const byLegacy = legacyName ? (armorTypes || []).find((a) => String(a.name || '').trim().toLowerCase() === legacyName) : undefined;
		setArmorTypeId(byLegacy?.id ?? (armorTypes[0]?.id ?? null));
	}, [open, armorTypeId, armorTypes, initial?.armorType]);

	const iconUrl = useMemo(() => asImageUrl(icon), [icon]);
	useEffect(() => {
		if (!iconFile) {
			setIconObjectUrl(null);
			return;
		}
		const url = URL.createObjectURL(iconFile);
		setIconObjectUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [iconFile]);

	useEffect(() => {
		if (!open) return;
		setRemoveIcon(false);
	}, [open]);
	const iconPreviewUrl = removeIcon ? null : (iconObjectUrl || iconUrl);
	const existingNames = useMemo(() => new Set((existing || []).filter((x) => x.id !== initial?.id).map((x) => (x.name || '').trim().toLowerCase())), [existing, initial?.id]);
	const movementSounds = useMemo(() => {
		return (sounds || []).filter((s) => (s.types || []).some((t) => (t.name || '').toLowerCase() === 'sonido de movimiento'));
	}, [sounds]);
	const selectedArmorType = useMemo(() => {
		if (armorTypeId == null) return null;
		return (armorTypes || []).find((a) => a.id === armorTypeId) || null;
	}, [armorTypeId, armorTypes]);

	if (!open) return null;

	return (
		<div className="modal-overlay" role="dialog" aria-modal="true">
			<div className="modal-content" style={{ width: 760, maxWidth: '94vw' }}>
					<button className="icon option" title="Cerrar" onClick={onClose} aria-label="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
					<FaTimes size={18} />
				</button>
				<h2 style={{ marginTop: 0 }}>{initial?.id ? 'Editar Raza' : 'Nueva Raza'}</h2>

				<form
					onSubmit={async (e) => {
						e.preventDefault();
						setError(null);
						const trimmed = name.trim();
						if (!trimmed) return setError('El nombre es requerido.');
						if (existingNames.has(trimmed.toLowerCase())) return setError('Ya existe una raza con ese nombre.');
						try {
							setSaving(true);
							await onSubmit({
								name: trimmed,
								icon: icon.trim(),
								iconFile,
								removeIcon,
								deathType,
								baseDefense,
								movementSpeed,
								movementType,
								movementSoundId,
								baseLife,
								lifeRegen,
								baseMana,
								baseManaRegen,
								initialMana,
								transportSize,
								armorTypeId,
								armorType: (selectedArmorType?.name || initial?.armorType || '').trim() || undefined,
							});
						} catch (err: any) {
							setError(err?.message || 'Error guardando raza');
						} finally {
							setSaving(false);
						}
					}}
				>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
						<label style={{ gridColumn: '1 / -1' }}>
							Nombre
							<input value={name} onChange={(e) => setName(e.target.value)} maxLength={140} />
						</label>

						<div>
							<div style={{ fontWeight: 800, marginBottom: 6 }}>Icono (64x64)</div>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                	<div style={{ position: 'relative' }} className="preview-container">
                                		{initial?.id && icon && !iconFile && !removeIcon ? (
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
                                		<CpImage src={iconPreviewUrl || undefined} width={64} height={64} fit="cover" />
                                	</div>
                                	<div style={{ flex: 1 }}>
                                		<input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files?.[0] || null)} />
                                		{icon ? <div style={{ marginTop: 6, opacity: 0.85, fontSize: 12, wordBreak: 'break-all' }}>{icon}</div> : null}
                                	</div>
                                </div>
                                {removeIcon ? <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>Se eliminará al guardar.</div> : null}
						</div>

						<label>
							Tipo de muerte
							<select value={deathType} onChange={(e) => setDeathType(e.target.value)}>
								{DEATH_TYPES.map((t) => (
									<option key={t} value={t}>{capitalizeFirst(t)}</option>
								))}
							</select>
						</label>

						<label>
							Tipo de movimiento
							<select value={movementType} onChange={(e) => setMovementType(e.target.value)}>
								{MOVEMENT_TYPES.map((t) => (
									<option key={t} value={t}>{capitalizeFirst(t)}</option>
								))}
							</select>
						</label>

						<label>
							Tipo de armadura
							<select value={armorTypeId ?? ''} onChange={(e) => setArmorTypeId(e.target.value ? Number(e.target.value) : null)} disabled={loadingArmorTypes || (armorTypes || []).length === 0}>
								{(armorTypes || []).map((t) => (
									<option key={t.id} value={t.id}>{capitalizeFirst(t.name || '')}</option>
								))}
							</select>
							{armorTypesError ? <div style={{ marginTop: 6, opacity: 0.85, fontSize: 12 }}>{armorTypesError}</div> : null}
						</label>

						<label>
							Defensa base
							<input type="number" value={baseDefense} onChange={(e) => setBaseDefense(Number(e.target.value))} />
						</label>

						<label>
							Velocidad de movimiento
							<input type="number" value={movementSpeed} onChange={(e) => setMovementSpeed(Number(e.target.value))} />
						</label>

						<label style={{ gridColumn: '1 / -1' }}>
							Sonido de movimiento
							<select value={movementSoundId ?? ''} onChange={(e) => setMovementSoundId(e.target.value ? Number(e.target.value) : null)}>
								<option value="">(ninguno)</option>
								{movementSounds.map((s) => (
									<option key={s.id} value={s.id}>{s.name}</option>
								))}
							</select>
							<div style={{ marginTop: 6, opacity: 0.85, fontSize: 12 }}>
								Solo aparecen sonidos con tipo "sonido de movimiento".
							</div>
						</label>

						<label>
							Vida base
							<input type="number" value={baseLife} onChange={(e) => setBaseLife(Number(e.target.value))} />
						</label>

						<label>
							Regeneración de vida
							<input type="number" step="0.01" value={lifeRegen} onChange={(e) => setLifeRegen(Number(e.target.value))} />
						</label>

						<label>
							Mana base
							<input type="number" value={baseMana} onChange={(e) => setBaseMana(Number(e.target.value))} />
						</label>

						<label>
							Regeneración de maná base
							<input type="number" step="0.01" value={baseManaRegen} onChange={(e) => setBaseManaRegen(Number(e.target.value))} />
						</label>

						<label>
							Maná inicial
							<input type="number" value={initialMana} onChange={(e) => setInitialMana(Number(e.target.value))} />
						</label>

						<label>
							Tamaño de transportación
							<input type="number" value={transportSize} onChange={(e) => setTransportSize(Number(e.target.value))} />
						</label>
					</div>

					{error ? <div style={{ color: '#e24444', fontSize: 13 }}>{error}</div> : null}

					<div className="actions">
						<button type="submit" className="confirm" disabled={saving}>{saving ? 'Confirmando...' : 'Confirmar'}</button>
						<button type="button" className="cancel" onClick={onClose} disabled={saving}>Cancelar</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default RaceModal;
