import React, { useEffect, useMemo, useState } from 'react';

function resolveImageUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

export interface CpImageFillProps {
	rawSrc?: string;
	src?: string;
	alt?: string;
	ariaHidden?: boolean;
	fit?: 'cover' | 'contain';
	style?: React.CSSProperties;
	className?: string;
}

const CpImageFill: React.FC<CpImageFillProps> = ({ rawSrc, src, alt = '', ariaHidden = true, fit = 'cover', style, className }) => {
	const resolved = useMemo(() => src || resolveImageUrl(rawSrc), [rawSrc, src]);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		setFailed(false);
	}, [resolved]);

	const missing = !resolved || failed;

	if (missing) {
		return (
			<div
				className={className}
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					textAlign: 'center',
					opacity: 0.55,
					fontSize: 12,
					padding: 8,
					...(style || {}),
				}}
			>
				Sin imagen
			</div>
		);
	}

	return (
		<img
			className={className}
			src={resolved}
			alt={alt}
			aria-hidden={ariaHidden}
			onError={() => setFailed(true)}
			style={{ width: '100%', height: '100%', objectFit: fit, display: 'block', ...(style || {}) }}
		/>
	);
};

export default CpImageFill;
