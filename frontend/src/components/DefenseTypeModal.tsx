import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { DefenseTypeItem } from '../interfaces/defenseType';

interface Props {
	open: boolean;
	initial?: Partial<DefenseTypeItem>;
	existing: DefenseTypeItem[];
	onClose: () => void;
	onSubmit: (data: { name: string }) => void | Promise<void>;
}

const DefenseTypeModal: React.FC<Props> = ({ open, initial, existing, onClose, onSubmit }) => {
	const [name, setName] = useState(initial?.name ?? '');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setName(initial?.name ?? '');
		setSaving(false);
		setError(null);
	}, [open, initial?.name]);

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
							await onSubmit({ name: trimmed });
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
