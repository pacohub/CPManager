import React, { useEffect, useMemo, useState } from 'react';
import { FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { ClassItem } from '../interfaces/class';
import { FactionItem } from '../interfaces/faction';
import { ProfessionItem } from '../interfaces/profession';

interface Props {
	faction: FactionItem;
	onEdit: () => void;
	onDelete: () => void;
	onOpen?: () => void;
	onRemoveCrest?: () => void;
	professions?: ProfessionItem[];
	classes?: ClassItem[];
}

const toBackendUrl = (path?: string) => {
	if (!path) return undefined;
	if (path.startsWith('http') || path.startsWith('data:')) return path;
	return encodeURI(`http://localhost:4000/${path.replace(/^\/+/, '')}`);
};

const FactionCard: React.FC<Props> = ({ faction, onEdit, onDelete, onOpen, onRemoveCrest, professions, classes }) => {
	// "Imagen" (iconImage) es el fondo de la tarjeta
	const [bgExists, setBgExists] = useState(true);
	const bgUrl = useMemo(() => toBackendUrl(faction.iconImage), [faction.iconImage]);

	// "Escudo" (crestImage) va a la izquierda del nombre
	const [crestExists, setCrestExists] = useState(true);
	const crestUrl = useMemo(() => toBackendUrl(faction.crestImage), [faction.crestImage]);

	useEffect(() => {
		if (!bgUrl) return setBgExists(true);
		fetch(bgUrl, { method: 'HEAD' })
			.then((res) => setBgExists(res.ok))
			.catch(() => setBgExists(false));
	}, [bgUrl]);

	useEffect(() => {
		if (!crestUrl) return setCrestExists(true);
		fetch(crestUrl, { method: 'HEAD' })
			.then((res) => setCrestExists(res.ok))
			.catch(() => setCrestExists(false));
	}, [crestUrl]);

	const bg = bgUrl && bgExists ? `url("${bgUrl}")` : undefined;

	const swatches = [faction.primaryColor, faction.secondaryColor, faction.tertiaryColor].filter(Boolean) as string[];

	const professionNames = useMemo(() => {
		return (professions || [])
			.map((p) => (p.name || '').trim())
			.filter(Boolean)
			.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
	}, [professions]);

	const professionSummary = useMemo(() => {
		if (!professionNames.length) return '';
		const visible = professionNames.slice(0, 3);
		const extra = professionNames.length - visible.length;
		const parts = visible.map((n) => `[${n}]`);
		if (extra > 0) parts.push(`[+${extra}]`);
		return parts.join(' ');
	}, [professionNames]);

	const hasPrimaryColor = Boolean((faction.primaryColor ?? '').trim());
	const hasImage = Boolean((faction.iconImage ?? '').trim());
	const hasCrest = Boolean((faction.crestImage ?? '').trim());
	const hasDescription = Boolean((faction.description ?? '').trim());
	const hasProfessionWarnings = useMemo(() => {
		return (professions || []).some((p) => !String(p.description ?? '').trim() || !String((p as any).link ?? '').trim());
	}, [professions]);
	const hasClassWarnings = useMemo(() => {
		return (classes || []).some((c) => {
			const icon = String((c as any).icon ?? '').trim();
			const description = String((c as any).description ?? '').trim();
			const level = Number((c as any).level);
			return !icon || !description || !Number.isFinite(level) || level <= 0;
		});
	}, [classes]);
	const missing: string[] = [];
	if (!hasPrimaryColor) missing.push('color primario');
	if (!hasCrest) missing.push('escudo');
	if (!hasImage) missing.push('imagen');
	if (!hasDescription) missing.push('descripción');
	if (hasProfessionWarnings) missing.push('profesiones incompletas');
	if (hasClassWarnings) missing.push('clases incompletas');
	const showWarning = missing.length > 0;
	const warningText = `Falta: ${missing.join(', ')}.`;

	return (
		<div
			className="campaign-card metallic-border"
			style={{ backgroundImage: bg, width: '100%', height: 'auto', aspectRatio: '4 / 3' }}
			tabIndex={0}
			aria-label={faction.name}
			role={onOpen ? 'button' : undefined}
			onClick={() => onOpen?.()}
			onKeyDown={(e) => {
				if (!onOpen) return;
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onOpen();
				}
			}}
		>
			{showWarning ? (
				<span
					className="campaign-warning"
					title={warningText}
					aria-label={warningText}
					onClick={(e) => e.stopPropagation()}
					onPointerDown={(e) => e.stopPropagation()}
				>
					<FaExclamationTriangle size={14} />
				</span>
			) : null}
			<div className="campaign-title">
				<div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
					{crestUrl && crestExists ? (
						<img
							src={crestUrl}
							alt=""
							aria-hidden="true"
							style={{ width: 22, height: 22, borderRadius: 6, objectFit: 'cover', flex: '0 0 auto' }}
						/>
					) : null}
					<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{faction.name}</div>
					{swatches.length ? (
						<div style={{ display: 'inline-flex', gap: 6 }}>
							{swatches.slice(0, 3).map((hex) => (
								<span
									key={hex}
									aria-label={hex}
									title={hex}
									style={{
										width: 12,
										height: 12,
										borderRadius: 999,
										background: hex,
										border: '1px solid rgba(0,0,0,0.35)',
									}}
								/>
							))}
						</div>
					) : null}
				</div>
				{professionNames.length ? (
					<div className="campaign-subtitle" title={professionNames.join(', ')}>
						{professionSummary}
					</div>
				) : null}
			</div>

			<div className="campaign-actions">
				{crestUrl && crestExists && onRemoveCrest ? (
					<button
						className="option"
						tabIndex={-1}
						aria-label="Eliminar escudo"
						onClick={(e) => {
							e.stopPropagation();
							onRemoveCrest();
						}}
						onPointerDown={(e) => e.stopPropagation()}
						style={{ fontSize: 12, padding: '0 6px' }}
					>
						Eliminar escudo
					</button>
				) : null}
				<button
					className="icon option"
					title="Editar"
					tabIndex={-1}
					onClick={(e) => {
						e.stopPropagation();
						onEdit();
					}}
					onPointerDown={(e) => e.stopPropagation()}
				>
					<FaEdit size={14} />
				</button>
				<button
					className="icon option"
					title="Eliminar"
					tabIndex={-1}
					onClick={(e) => {
						e.stopPropagation();
						onDelete();
					}}
					onPointerDown={(e) => e.stopPropagation()}
				>
					<FaTrash size={14} />
				</button>
			</div>

			<div className="campaign-desc">{faction.description}</div>
		</div>
	);
};

export default FactionCard;
