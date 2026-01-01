import React, { useEffect, useMemo, useState } from 'react';

function buildImageCandidates(raw?: string): string[] {
	const v = (raw || '').trim();
	if (!v) return [];
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return [v];
	if (v.startsWith('/')) {
		const rel = v.replace(/^\/+/, '');
		const candidates: string[] = [];
		try {
			const origin = window.location.origin.replace(/\/$/, '');
			candidates.push(`${origin}/${rel}`);
		} catch {
			// ignore
		}
		candidates.push(`http://localhost:4000/${rel}`);
		return candidates.map((u) => encodeURI(u));
	}
	return [];
}

export interface CpImageProps {
	rawSrc?: string;
	src?: string;
	alt?: string;
	ariaHidden?: boolean;
	width: number;
	height: number;
	fit?: 'cover' | 'contain';
	frameClassName?: string;
	frameStyle?: React.CSSProperties;
	imgStyle?: React.CSSProperties;
	showFrame?: boolean;
}

const CpImage: React.FC<CpImageProps> = ({
	rawSrc,
	src,
	alt = '',
	ariaHidden = true,
	width,
	height,
	fit = 'cover',
	frameClassName = 'metallic-border metallic-border-square',
	frameStyle,
	imgStyle,
	showFrame = true,
}) => {
	const candidates = useMemo(() => (src ? [src] : buildImageCandidates(rawSrc)), [rawSrc, src]);
	const [attempt, setAttempt] = useState(0);
	const [failed, setFailed] = useState(false);
	const resolved = candidates && candidates.length > 0 ? candidates[attempt] : undefined;

	useEffect(() => {
		setFailed(false);
		setAttempt(0);
	}, [rawSrc, src]);

	const shouldShowText = width >= 48 && height >= 48;
	const missing = !resolved || failed;

	const inner = missing ? (
		<div
			style={{
				width,
				height,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				textAlign: 'center',
				opacity: 0.55,
				fontSize: shouldShowText ? 12 : 0,
				lineHeight: 1.1,
				padding: shouldShowText ? 6 : 0,
			}}
		>
			{shouldShowText ? 'Sin imagen' : null}
		</div>
	) : (
			<img
				src={resolved}
				alt={alt}
				aria-hidden={ariaHidden}
				onError={() => {
					// try next candidate if available
					if (candidates && attempt + 1 < candidates.length) {
						setAttempt((a) => a + 1);
						setFailed(false);
					} else {
						setFailed(true);
					}
				}}
				style={{ width, height, objectFit: fit, display: 'block', ...(imgStyle || {}) }}
			/>
	);

	if (!showFrame) return inner;

	return (
		<div
			className={frameClassName}
			style={{
				width,
				height,
				minWidth: width,
				backgroundImage: 'none',
				...(frameStyle || {}),
			}}
		>
			{inner}
		</div>
	);
};

export default CpImage;
