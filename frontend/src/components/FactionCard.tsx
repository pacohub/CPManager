import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaExclamation } from 'react-icons/fa';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { ClassItem } from '../interfaces/class';
import { FactionItem } from '../interfaces/faction';
import { ProfessionItem } from '../interfaces/profession';
import CpImage from './CpImage';

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
	// "Imagen" (iconImage) se usa como fondo de la tarjeta
	const [iconExists, setIconExists] = useState(true);
	const iconUrl = useMemo(() => toBackendUrl(faction.iconImage), [faction.iconImage]);

	// "Escudo" (crestImage) se muestra como icono antes del nombre
	const [crestExists, setCrestExists] = useState(false);
	const crestUrl = useMemo(() => toBackendUrl(faction.crestImage), [faction.crestImage]);

	useEffect(() => {
		if (!iconUrl) return setIconExists(true);
		fetch(iconUrl, { method: 'HEAD' })
			.then((res) => setIconExists(res.ok))
			.catch(() => setIconExists(false));
	}, [iconUrl]);

	useEffect(() => {
		if (!crestUrl) return setCrestExists(false);
		fetch(crestUrl, { method: 'HEAD' })
			.then((res) => setCrestExists(res.ok))
			.catch(() => setCrestExists(false));
	}, [crestUrl]);

	const iconOk = iconUrl && iconExists;

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

	// Always apply the background image if an icon URL is provided
	const backgroundStyle: React.CSSProperties = iconUrl
		? { backgroundImage: `url(${iconUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
		: { backgroundImage: 'none' };

	const [showFullDesc, setShowFullDesc] = useState(false);
	const [needsToggle, setNeedsToggle] = useState(false);
	const descRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const el = descRef.current;
		if (!el) {
			// fallback to length-based check
			setNeedsToggle(Boolean(faction.description && faction.description.length > 160));
			return;
		}
		// run after paint
		const check = () => {
			const content = el;
			setNeedsToggle(content.scrollHeight > content.clientHeight + 2);
		};
		check();
		// also re-check on window resize
		window.addEventListener('resize', check);
		return () => window.removeEventListener('resize', check);
	}, [faction.description, showFullDesc]);

	return (
		<div
			className={`campaign-card metallic-border${crestExists ? ' has-crest' : ''}`}
			style={{ ...backgroundStyle, width: '100%', height: 'auto', aspectRatio: '4 / 3' }}
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
					<FaExclamation size={14} />
				</span>
			) : null}
			{crestUrl && crestExists ? (
				<div className="faction-crest-center" aria-hidden="true">
					<CpImage
						src={crestUrl}
						width={120}
						height={120}
						fit="cover"
						showFrame={false}
						imgStyle={{ borderRadius: 8, width: '100%', height: '100%' }}
					/>
				</div>
			) : null}
			{/* swatches moved to footer under the name */}
			<div className="faction-footer">
				<div className="faction-name-row">
					{swatches.length ? (
						<div className="faction-swatches-row" aria-hidden="true">
							{swatches.slice(0, 3).map((hex) => (
								<span
									key={hex}
									aria-label={hex}
									title={hex}
									style={{ background: hex }}
								/>
							))}
						</div>
					) : null}
					<div className="faction-top-row"></div>	
					<div className="faction-name">{faction.name}</div>
				</div>
			</div>

			<div className="campaign-actions">
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

			<div className="campaign-desc" onClick={(e)=>e.stopPropagation()}>
				<div ref={descRef} className={`campaign-desc-content ${showFullDesc ? 'expanded' : ''}`}>{faction.description}</div>
				{professionNames.length ? (
					<div className="campaign-subtitle" title={professionNames.join(', ')} style={{ marginTop: 8 }}>
						{professionSummary}
					</div>
				) : null}
				{(needsToggle || (faction.description && faction.description.length > 160)) ? (
					<button
						className="desc-toggle"
						onClick={(e) => { e.stopPropagation(); setShowFullDesc((s) => !s); }}
						aria-expanded={showFullDesc}
						aria-label={showFullDesc ? 'Mostrar menos descripción' : 'Mostrar más descripción'}
					>
						{showFullDesc ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
					</button>
				) : null}
			</div>
		</div>
	);
};

export default FactionCard;
