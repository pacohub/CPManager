import React, { useEffect, useMemo, useRef, useState } from 'react';
import CpImage from './CpImage';

export type IconSelectItem = {
	value: number;
	label: string;
	iconUrl?: string | null;
};

interface IconSelectProps {
	value: number | '';
	placeholder: string;
	items: IconSelectItem[];
	disabled?: boolean;
	onChange: (value: number | '') => void;
}

const IconSelect: React.FC<IconSelectProps> = ({ value, placeholder, items, disabled, onChange }) => {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement | null>(null);

	const selected = useMemo(() => {
		if (!value) return null;
		return items.find((i) => i.value === Number(value)) ?? null;
	}, [items, value]);

	useEffect(() => {
		if (!open) return;
		const onDocMouseDown = (e: MouseEvent) => {
			const root = rootRef.current;
			if (!root) return;
			if (!root.contains(e.target as any)) setOpen(false);
		};
		document.addEventListener('mousedown', onDocMouseDown);
		return () => document.removeEventListener('mousedown', onDocMouseDown);
	}, [open]);

	return (
		<div ref={rootRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
			<button
				type="button"
				disabled={disabled}
				onClick={() => setOpen((v) => !v)}
				style={{
					width: '100%',
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					justifyContent: 'space-between',
					background: 'rgba(0,0,0,0.35)',
					border: '1px solid rgba(255,215,0,0.35)',
					color: '#e2d9b7',
					padding: '6px 8px',
					borderRadius: 6,
					cursor: disabled ? 'not-allowed' : 'pointer',
				}}
			>
				<span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '1 1 auto' }}>
					<CpImage
						src={selected?.iconUrl || undefined}
						width={16}
						height={16}
						fit="contain"
						showFrame={false}
						imgStyle={{ flex: '0 0 auto' }}
					/>
					<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
						{selected ? selected.label : placeholder}
					</span>
				</span>
				<span style={{ opacity: 0.9, flex: '0 0 auto' }}>▾</span>
			</button>

			{open && !disabled ? (
				<div
					style={{
						position: 'absolute',
						top: 'calc(100% + 6px)',
						left: 0,
						right: 0,
						zIndex: 60,
						maxHeight: 260,
						overflowY: 'auto',
						background: 'rgba(0,0,0,0.92)',
						border: '1px solid rgba(255,215,0,0.35)',
						borderRadius: 8,
						padding: 6,
					}}
					role="listbox"
				>
					{items.length === 0 ? (
						<div style={{ padding: 8, opacity: 0.85, fontSize: 13 }}>{placeholder}</div>
					) : null}
					{items.map((it) => (
						<button
							type="button"
							key={it.value}
							onClick={() => {
								onChange(it.value);
								setOpen(false);
							}}
							style={{
								width: '100%',
								textAlign: 'left',
								display: 'flex',
								alignItems: 'center',
								gap: 8,
								padding: '8px 8px',
								borderRadius: 6,
								border: '1px solid rgba(255,215,0,0.12)',
								background: 'rgba(0,0,0,0.35)',
								color: '#e2d9b7',
								cursor: 'pointer',
							}}
						>
							<CpImage src={it.iconUrl || undefined} width={16} height={16} fit="contain" showFrame={false} />
							<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
						</button>
					))}
					<button
						type="button"
						onClick={() => {
							onChange('');
							setOpen(false);
						}}
						style={{
							width: '100%',
							marginTop: 6,
							textAlign: 'left',
							padding: '8px 8px',
							borderRadius: 6,
							border: '1px solid rgba(255,215,0,0.12)',
							background: 'rgba(0,0,0,0.2)',
							color: '#e2d9b7',
							opacity: 0.9,
							cursor: 'pointer',
						}}
					>
						Limpiar selección
					</button>
				</div>
			) : null}
		</div>
	);
};

export default IconSelect;
