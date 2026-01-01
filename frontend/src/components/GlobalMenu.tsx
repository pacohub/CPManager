import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaCompass, FaCubes, FaMountain, FaFlag, FaUser, FaPaw, FaStar, FaHandPaper } from 'react-icons/fa';
import { FaCogs, FaVolumeUp, FaRunning, FaShieldAlt } from 'react-icons/fa';
import { GiArmorUpgrade, GiChest, GiCrossedSwords, GiWarPick } from 'react-icons/gi';

const GlobalMenu: React.FC = () => {
	const navigate = useNavigate();
	const [backingUp, setBackingUp] = useState(false);
	const [lastBackup, setLastBackup] = useState<any>(null);

	useEffect(() => {
		const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
		let mounted = true;
		const fetchLast = async () => {
			try {
				const r = await fetch(`${apiBase}/backup/last`);
				const data = await r.json();
				if (!mounted) return;
				if (data?.ok && data.file) setLastBackup({ name: data.file.name, mtime: data.file.mtime, url: data.file.url });
			} catch {}
		};
		fetchLast();
		const iv = setInterval(fetchLast, 60_000); // refresh every minute
		return () => { mounted = false; clearInterval(iv); };
	}, []);

	const formatRelative = (ts: number) => {
		const diff = Date.now() - ts;
		const sec = Math.floor(diff / 1000);
		if (sec < 60) return `hace ${sec}s`;
		const min = Math.floor(sec / 60);
		if (min < 60) return `hace ${min}m`;
		const hr = Math.floor(min / 60);
		if (hr < 24) return `hace ${hr}h`;
		const days = Math.floor(hr / 24);
		if (days < 30) return `hace ${days}d`;
		const months = Math.floor(days / 30);
		return `hace ${months}m`;
	};

	const hexToRgb = (hex: string) => {
		const h = hex.replace('#', '');
		return {
			r: parseInt(h.substring(0, 2), 16),
			g: parseInt(h.substring(2, 4), 16),
			b: parseInt(h.substring(4, 6), 16),
		};
	};

	const rgbToHex = (r: number, g: number, b: number) => {
		const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	};

	// interpolate from baseColor to red as time approaches one month
	const computeColorFor = (ts: number) => {
		const base = hexToRgb('#e2d9b7');
		const target = { r: 255, g: 0, b: 0 };
		const month = 30 * 24 * 60 * 60 * 1000;
		const age = Date.now() - ts;
		const t = Math.max(0, Math.min(1, age / month));
		const r = base.r + (target.r - base.r) * t;
		const g = base.g + (target.g - base.g) * t;
		const b = base.b + (target.b - base.b) * t;
		return rgbToHex(r, g, b);
	};

	const handleBackup = async () => {
		setBackingUp(true);
		const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
		try {
			const res = await fetch(`${apiBase}/backup/create`, { method: 'POST' });
			const data = await res.json();
			if (data.ok) {
				if (data.uploaded && data.driveWebViewLink) {
					window.open(data.driveWebViewLink, '_blank');
				} else if (data.backupUrl) {
					window.open(data.backupUrl, '_blank');
				} else {
					alert('Backup creado en: ' + data.path);
				}
				// refresh last backup info
				try {
					const res2 = await fetch(`${apiBase}/backup/last`);
					const d2 = await res2.json();
					if (d2?.ok && d2.file) setLastBackup({ name: d2.file.name, mtime: d2.file.mtime, url: d2.file.url });
				} catch {}
			} else {
				alert('Error al crear backup');
			}
		} catch (e: any) {
			alert('Error al crear backup: ' + (e?.message || e));
		} finally {
			setBackingUp(false);
		}
	};

	return (
		<div className="panel-sticky-header">
			<div className="panel-header" style={{ justifyContent: 'center' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
						<button className="icon" aria-label="Saga" data-tooltip="Saga" onClick={() => navigate('/')}>
							<FaBook size={26} color="#FFD700" />
						</button>
					<button className="icon" aria-label="Mapas" data-tooltip="Mapas" onClick={() => navigate('/maps')}>
						<FaCompass size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Componentes" data-tooltip="Componentes" onClick={() => navigate('/components')}>
						<FaCubes size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Mecánicas" data-tooltip="Mecánicas" onClick={() => navigate('/mechanics')}>
						<FaCogs size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Profesiones" data-tooltip="Profesiones" onClick={() => navigate('/professions')}>
						<GiWarPick size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Recursos" data-tooltip="Recursos" onClick={() => navigate('/resources')}>
						<FaMountain size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Objetos" data-tooltip="Objetos" onClick={() => navigate('/objects')}>
						<GiChest size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Facciones" data-tooltip="Facciones" onClick={() => navigate('/factions')}>
						<FaFlag size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Personajes" data-tooltip="Personajes" onClick={() => navigate('/characters')}>
						<FaUser size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Clases" data-tooltip="Clases" onClick={() => navigate('/classes')}>
						<GiCrossedSwords size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Razas" data-tooltip="Razas" onClick={() => navigate('/races')}>
						<FaPaw size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Tipos de armadura" data-tooltip="Tipos de armadura" onClick={() => navigate('/armor-types')}>
						<GiArmorUpgrade size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Tipos de defensa" data-tooltip="Tipos de defensa" onClick={() => navigate('/defense-types')}>
						<FaShieldAlt size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Animaciones" data-tooltip="Animaciones" onClick={() => navigate('/animations')}>
						<FaRunning size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Sonidos" data-tooltip="Sonidos" onClick={() => navigate('/sounds')}>
						<FaVolumeUp size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Efectos visuales" data-tooltip="Efectos visuales" onClick={() => navigate('/visual-effects')}>
						<div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
							<FaStar size={10} color="#FFD700" />
							<FaStar size={10} color="#FFD700" />
							<FaStar size={10} color="#FFD700" />
						</div>
					</button>
					<button className="icon" aria-label="Efectos" data-tooltip="Efectos" onClick={() => navigate('/effects')}>
						<FaStar size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Habilidades" data-tooltip="Habilidades" onClick={() => navigate('/skills')}>
						<FaHandPaper size={26} color="#FFD700" />
					</button>
					<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
						<button className="icon" aria-label="Backup" data-tooltip="Crear backup" onClick={handleBackup}>
							<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={backingUp ? 'rotating' : ''}>
								<title>Backup</title>
								<path d="M16 16V11H13V8H11V11H8L12 15L16 11V16Z" fill="#FFD700" />
								<path d="M20.39 10.56C19.84 7.86 17.3 6 14.5 6C12.97 6 11.6 6.6 10.66 7.58C9.76 7.21 8.77 7 7.75 7C4.53 7 2 9.53 2 12.75C2 16 4.5 18.5 7.75 18.5H18C20.76 18.5 22.98 16.28 22.98 13.52C23 12.73 22.88 11.97 22.64 11.27C21.9 11.04 21.11 10.76 20.39 10.56Z" fill="#FFD700" />
							</svg>
							</button>
							{lastBackup ? <div style={{ fontSize: 12, color: computeColorFor(lastBackup.mtime) }} title={new Date(lastBackup.mtime).toLocaleString()}>Último: {formatRelative(lastBackup.mtime)}</div> : null}
						</div>
				</div>
			</div>
		</div>
	);
};

export default GlobalMenu;
