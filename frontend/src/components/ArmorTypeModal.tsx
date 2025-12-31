import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { ArmorTypeItem } from '../interfaces/armorType';
import { SoundItem } from '../interfaces/sound';

interface Props {
	open: boolean;
	initial?: Partial<ArmorTypeItem>;
	existing: ArmorTypeItem[];
	sounds: SoundItem[];
	onClose: () => void;
	onSubmit: (data: { name: string; soundIds: number[] }) => void | Promise<void>;
}

const ArmorTypeModal: React.FC<Props> = ({ open, initial, existing, sounds, onClose, onSubmit }) => {
	const [name, setName] = useState(initial?.name ?? '');
	const [soundIds, setSoundIds] = useState<number[]>([]);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setName(initial?.name ?? '');
		const ids = ((initial as any)?.sounds || []).map((s: any) => Number(s?.id)).filter((n: any) => Number.isFinite(n) && n > 0);
		setSoundIds(Array.from(new Set(ids)));
		setSaving(false);
		setError(null);
	}, [open, initial]);

	const existingNames = useMemo(() => {
		return new Set(
			(existing || [])
				.filter((x) => x.id !== (initial as any)?.id)
				.map((x) => (x.name || '').trim().toLowerCase())
				.filter(Boolean),
		);
	}, [existing, initial]);

	const orderedSounds = useMemo(() => {
		return (sounds || [])
			.slice()
			.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [sounds]);

	if (!open) return null;

	return (
		<div className="modal-overlay" role="dialog" aria-modal="true">
			<div className="modal-content" style={{ width: 720, maxWidth: '94vw' }}>
				<button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
					<FaTimes size={18} />
				</button>
				<h2 style={{ marginTop: 0 }}>{(initial as any)?.id ? 'Editar Tipo de armadura' : 'Nuevo Tipo de armadura'}</h2>

				<form
					onSubmit={async (e) => {
						e.preventDefault();
						setError(null);
						const trimmed = name.trim();
						if (!trimmed) return setError('El nombre es requerido.');
						if (existingNames.has(trimmed.toLowerCase())) return setError('Ya existe un tipo de armadura con ese nombre.');
						try {
							setSaving(true);
							await onSubmit({ name: trimmed, soundIds });
						} catch (err: any) {
							setError(err?.message || 'Error guardando tipo de armadura');
						} finally {
							setSaving(false);
						}
					}}
					autoComplete="off"
				>
					<label style={{ display: 'block' }}>
						Nombre
						<input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
					</label>

					<div style={{ marginTop: 12 }}>
						<div style={{ fontWeight: 800, marginBottom: 6 }}>Sonidos de golpes</div>
						<select
							multiple
							value={soundIds.map(String)}
							onChange={(e) => {
								const next = Array.from(e.target.selectedOptions)
									.map((o) => Number(o.value))
									.filter((n) => Number.isFinite(n) && n > 0);
								setSoundIds(Array.from(new Set(next)));
							}}
							style={{ width: '100%', minHeight: 160 }}
						>
							{orderedSounds.map((s) => (
								<option key={s.id} value={s.id}>
									{s.name}
								</option>
							))}
						</select>
						<div style={{ marginTop: 6, opacity: 0.85, fontSize: 12 }}>Ctrl/Shift para selección múltiple.</div>
					</div>

					{error ? <div style={{ color: '#e24444', fontSize: 13, marginTop: 10 }}>{error}</div> : null}

					<div className="actions">
						<button type="submit" className="confirm" disabled={saving}>
							{saving ? 'Confirmando...' : 'Confirmar'}
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

export default ArmorTypeModal;
