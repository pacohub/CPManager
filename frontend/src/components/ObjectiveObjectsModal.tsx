import React, { useEffect, useState } from 'react';
import { FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { GiChest } from 'react-icons/gi';
import { GameObjectItem } from '../interfaces/gameObject';

interface Props {
	open: boolean;
	objectiveId: number;
	objectiveName?: string;
	objects: GameObjectItem[];
	initialSelectedIds?: number[];
	onClose: () => void;
	onSave: (objectIds: number[] | undefined) => Promise<void> | void;
}

const ObjectiveObjectsModal: React.FC<Props> = ({ open, objectiveId, objectiveName, objects, initialSelectedIds, onClose, onSave }) => {
	const [selected, setSelected] = useState<number[]>(initialSelectedIds ? initialSelectedIds.slice() : []);
	const [toAddId, setToAddId] = useState<number | ''>('');

	useEffect(() => {
		if (!open) return;
		setSelected(initialSelectedIds ? initialSelectedIds.slice() : []);
	}, [open, initialSelectedIds]);

	if (!open) return null;

	return (
		<div className="modal-overlay">
			<div className="modal-content" style={{ maxWidth: 720, minWidth: 420 }}>
				<button className="icon option" onClick={onClose} title="Cerrar" style={{ position: 'absolute', top: 12, right: 12 }}>
					<FaTimes size={18} color="#e2d9b7" />
				</button>
				<h2 className="modal-title">Objetos asociados</h2>
				<div style={{ padding: '8px 12px 12px', maxHeight: '60vh', overflowY: 'auto' }}>
					<div style={{ marginBottom: 8, opacity: 0.95 }}>Objetivo: {objectiveName ?? objectiveId}</div>
					<div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
						<select value={toAddId} onChange={(e) => setToAddId(e.target.value === '' ? '' : Number(e.target.value))} style={{ flex: '1 1 auto', padding: 8 }}>
							{/* debug: toAddId may be string/number; onChange converts to Number */}
							<option value="">Seleccionar objeto...</option>
							{(objects || []).filter((o) => !selected.includes(o.id)).map((o) => (
								<option key={o.id} value={o.id}>{o.name}</option>
							))}
						</select>
						<button
							type="button"
							className="icon option"
							title="Añadir objeto"
							onClick={() => {
								console.log('ObjectiveObjectsModal:add click', { toAddId });
								if (toAddId === '' || toAddId === null || toAddId === undefined) return;
								const asNum = Number(toAddId);
								if (!Number.isFinite(asNum)) {
									console.warn('ObjectiveObjectsModal: toAddId is not a finite number', { toAddId, asNum });
									return;
								}
								setSelected((prev) => {
									const next = Array.from(new Set([...prev, asNum]));
									console.log('ObjectiveObjectsModal:selected after add', { next });
									return next;
								});
								setToAddId('');
							}}
						>
							<GiChest size={18} color="#e2d9b7" />
						</button>
					</div>

					<div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
						{(selected || []).map((id) => {
							const o = (objects || []).find((x) => x.id === id);
							if (!o) return null;
							return (
								<div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 8, borderRadius: 6, background: '#0b0b0b', border: '1px solid rgba(255,215,0,0.06)' }}>
									<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.name}</div>
									<button
										type="button"
										className="icon option"
										title="Desvincular"
										onClick={() => setSelected((prev) => prev.filter((v) => v !== o.id))}
									>
										<FaExternalLinkAlt size={14} style={{ transform: 'rotate(-30deg)', color: '#e2d9b7' }} />
									</button>
								</div>
							);
						})}
					</div>
					<div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
						<button
							type="button"
							onClick={async () => {
								// If user selected an item in the dropdown but didn't press "Añadir",
								// include the current `toAddId` in the final ids to save.
								const pending = (toAddId === '' || toAddId === null || toAddId === undefined) ? [] : [Number(toAddId)];
								const all = Array.from(new Set([...(selected || []), ...pending]));
								const finalIds = all.filter((v) => Number.isFinite(Number(v))).map((v) => Number(v));
								console.log('ObjectiveObjectsModal:onSave', { objectiveId, selected, toAddId, finalIds });
								await onSave(finalIds.length ? finalIds : undefined);
								onClose();
							}}
							className="confirm"
						>
							Confirmar
						</button>
						<button type="button" className="cancel" onClick={onClose}>Cancelar</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ObjectiveObjectsModal;
