import React, { useEffect, useMemo, useState } from 'react';

interface NameModalProps {
	open: boolean;
	title: string;
	confirmText?: string;
	cancelText?: string;
	initialValue?: string;
	placeholder?: string;
	helperText?: string;
	errorText?: string | null;
	onConfirm: (name: string) => void;
	onCancel: () => void;
}

const NameModal: React.FC<NameModalProps> = ({
	open,
	title,
	confirmText = 'Crear',
	cancelText = 'Cancelar',
	initialValue = '',
	placeholder = 'Nombre',
	helperText,
	errorText,
	onConfirm,
	onCancel,
}) => {
	const [value, setValue] = useState(initialValue);
	const trimmed = useMemo(() => value.trim(), [value]);

	useEffect(() => {
		if (!open) return;
		setValue(initialValue);
	}, [open, initialValue]);

	if (!open) return null;

	return (
		<div className="modal-overlay" onMouseDown={onCancel}>
			<div
				className="modal-content"
				onMouseDown={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
			>
				<h2 className="modal-title">{title}</h2>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
					<input
						autoFocus
						type="text"
						value={value}
						placeholder={placeholder}
						onChange={(e) => setValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Escape') onCancel();
							if (e.key === 'Enter') {
								if (!trimmed) return;
								onConfirm(trimmed);
							}
						}}
						style={{ width: '100%', padding: 8 }}
					/>
					{helperText ? <div style={{ fontSize: 12, opacity: 0.85 }}>{helperText}</div> : null}
					{errorText ? <div style={{ color: 'red', fontSize: 12 }}>{errorText}</div> : null}
				</div>
				<div className="actions" style={{ marginTop: 12 }}>
					<button className="button confirm" disabled={!trimmed} onClick={() => onConfirm(trimmed)}>
						{confirmText}
					</button>
					<button className="button cancel" onClick={onCancel}>
						{cancelText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default NameModal;
