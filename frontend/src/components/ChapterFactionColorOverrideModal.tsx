import React, { useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { WC3_PLAYER_COLORS } from '../js/wc3PlayerColors';

type Props = {
	open: boolean;
	initialColor: string | null | undefined;
	onClose: () => void;
	onSave: (colorOverride: string | null) => Promise<void> | void;
};

function findColor(value: string | null | undefined) {
	if (!value) return null;
	return WC3_PLAYER_COLORS.find((c) => c.hex === value) ?? null;
}

const ChapterFactionColorOverrideModal: React.FC<Props> = ({ open, initialColor, onClose, onSave }) => {
	const [saving, setSaving] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [selected, setSelected] = useState<string | null>(() => initialColor ?? null);

	const selectedColor = useMemo(() => findColor(selected), [selected]);

	if (!open) return null;

	return (
		<div
			className="modal-overlay"
			onMouseDown={(e) => {
				e.stopPropagation();
				onClose();
			}}
		>
			<div
				className="modal-content"
				style={{ maxWidth: 520, width: '92%', maxHeight: '86vh', overflowY: 'auto' }}
				onMouseDown={(e) => e.stopPropagation()}
			>
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
					<h2 style={{ margin: 0 }}>Override de color (solo este capítulo)</h2>
					<button className="icon option" title="Cerrar" onClick={onClose} disabled={saving}>
						<FaTimes size={16} />
					</button>
				</div>

				<div style={{ marginTop: 12, opacity: 0.9 }}>
					Elige un color de jugador para esta facción en este capítulo. No modifica la facción global.
				</div>

				<div style={{ marginTop: 12 }}>
					<div style={{ fontWeight: 800, marginBottom: 6 }}>Color</div>

					<div style={{ position: 'relative' }}>
						<button
							type="button"
							className="wc3-color-combobox"
							onClick={() => setMenuOpen((v) => !v)}
							aria-expanded={menuOpen}
						>
							<span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
								<span
									style={{
										width: 14,
										height: 14,
										borderRadius: 3,
										border: '1px solid rgba(255,215,0,0.45)',
										background: selectedColor?.hex ?? 'rgba(0,0,0,0.35)',
										flex: '0 0 auto',
									}}
								/>
								<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
									{selectedColor ? selectedColor.name : 'Sin override'}
								</span>
							</span>
							<span style={{ opacity: 0.85 }}>{menuOpen ? '▲' : '▼'}</span>
						</button>

						{menuOpen ? (
							<div className="wc3-color-menu" role="listbox">
								<button
									type="button"
									className="wc3-color-option"
									onClick={() => {
										setSelected(null);
										setMenuOpen(false);
									}}
								>
									<span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
										<span
											style={{
												width: 14,
												height: 14,
												borderRadius: 3,
												border: '1px solid rgba(255,215,0,0.45)',
												background: 'rgba(0,0,0,0.35)',
											}}
										/>
										Sin override
									</span>
								</button>

								{WC3_PLAYER_COLORS.map((c) => (
									<button
										type="button"
										key={c.id}
										className="wc3-color-option"
										onClick={() => {
											setSelected(c.hex);
											setMenuOpen(false);
										}}
									>
										<span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
											<span
												style={{
													width: 14,
													height: 14,
													borderRadius: 3,
													border: '1px solid rgba(255,215,0,0.45)',
													background: c.hex,
												}}
											/>
											{c.name}
										</span>
									</button>
								))}
							</div>
						) : null}
					</div>
				</div>

				<div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
					<button
						className="icon option"
						onClick={async () => {
							setSaving(true);
							try {
								await onSave(selected);
								onClose();
							} finally {
								setSaving(false);
							}
						}}
						disabled={saving}
						title="Guardar"
					>
						Guardar
					</button>
					<button className="icon option" onClick={onClose} disabled={saving}>
						Cancelar
					</button>
				</div>
			</div>
		</div>
	);
};

export default ChapterFactionColorOverrideModal;
