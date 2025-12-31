import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaLock, FaLockOpen } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';
import { FaEdit, FaExternalLinkAlt, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import ComponentModal from '../components/ComponentModal';
import MapModal from '../components/MapModal';
import CpImageFill from '../components/CpImageFill';
import { ComponentItem } from '../interfaces/component';
import { MapItem } from '../interfaces/map';
import { createComponent, getComponents } from './componentApi';
import { deleteMap, getMap, getMapComponents, getMaps, setMapComponents, updateMap } from './mapApi';

function normalizeLink(raw: string): string {
	const v = (raw || '').trim();
	if (!v) return '';
	if (/^https?:\/\//i.test(v)) return v;
	return `https://${v}`;
}

function asImageUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

interface Props {
	mapId: number;
	onBack: () => void;
}

const MapDetail: React.FC<Props> = ({ mapId, onBack }) => {
	const [map, setMap] = useState<MapItem | null>(null);
	const [allMaps, setAllMaps] = useState<MapItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [components, setComponents] = useState<ComponentItem[]>([]);
	const [componentIds, setComponentIds] = useState<number[]>([]);
	const [componentSearch, setComponentSearch] = useState('');
	const didInitComponents = useRef(false);
	const saveTokenRef = useRef(0);
	const saveTimerRef = useRef<number | null>(null);

	const [editOpen, setEditOpen] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [componentModalOpen, setComponentModalOpen] = useState(false);
	const [linkingEnabled, setLinkingEnabled] = useState(false);

	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [m, maps, all, assigned] = await Promise.all([
				getMap(mapId),
				getMaps(),
				getComponents(),
				getMapComponents(mapId),
			]);
			setMap(m);
			setAllMaps(maps || []);
			setComponents(all || []);
			setComponentIds((assigned || []).map((c) => Number((c as any).id)).filter((n) => Number.isFinite(n)));
			didInitComponents.current = true;
		} catch (e: any) {
			console.error('Error cargando detalle de mapa', e);
			setError(e?.message || 'Error cargando mapa');
			setMap(null);
			setAllMaps([]);
			setComponents([]);
			setComponentIds([]);
			didInitComponents.current = true;
		} finally {
			setLoading(false);
		}
	}, [mapId]);

	useEffect(() => {
		refresh().catch(() => undefined);
	}, [refresh]);

	useEffect(() => {
		// Auto-save component linkage (debounced) after initial load.
		if (!didInitComponents.current) return;
		if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
		const token = ++saveTokenRef.current;
		saveTimerRef.current = window.setTimeout(async () => {
			try {
				await setMapComponents(mapId, componentIds);
			} catch (e) {
				console.error('Error guardando componentes del mapa', e);
			} finally {
				// ignore stale writes
				if (saveTokenRef.current !== token) return;
			}
		}, 350);
		return () => {
			if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
		};
	}, [mapId, componentIds]);

	const imageUrl = useMemo(() => asImageUrl(map?.image), [map?.image]);
	const fileUrl = useMemo(() => {
		const v = (map?.file || '').trim();
		if (!v) return '';
		if (v.startsWith('http://') || v.startsWith('https://')) return v;
		if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
		return normalizeLink(v);
	}, [map?.file]);

	const filteredComponents = useMemo(() => {
		const q = componentSearch.trim().toLowerCase();
		const selected = new Set(componentIds);
		const list = (components || [])
			.slice()
			.sort((a, b) => {
				const aSelected = selected.has(a.id);
				const bSelected = selected.has(b.id);
				if (aSelected !== bSelected) return aSelected ? -1 : 1;
				return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
			});
		if (!q) return list;
		return list.filter((c) => (c.name || '').toLowerCase().includes(q) || (c.type || '').toLowerCase().includes(q));
	}, [components, componentIds, componentSearch]);

	// NOTE: didInitComponents is flipped inside refresh() once we have initial componentIds.

	return (
		<div className="panel panel-corners-soft block-border block-panel-border">
			<div className="panel-header" style={{ position: 'relative' }}>
				<button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
					<FaArrowLeft size={22} color="#FFD700" />
				</button>
				<div
					style={{
						position: 'absolute',
						left: '50%',
						transform: 'translateX(-50%)',
						top: 0,
						bottom: 0,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						textAlign: 'center',
						maxWidth: 'calc(100% - 200px)',
						padding: '6px 100px 8px 100px',
						minWidth: 0,
					}}
				>
					<div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.1 }}>Mapa</div>
					<div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1, minWidth: 0, wordBreak: 'break-word' }}>{map?.name || 'Mapa'}</div>
				</div>
				<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
					<button className="icon" title="Editar" aria-label="Editar" onClick={() => setEditOpen(true)} disabled={!map}>
						<FaEdit size={18} color="#FFD700" />
					</button>
					<button className="icon" title="Eliminar" aria-label="Eliminar" onClick={() => setConfirmOpen(true)} disabled={!map}>
						<FaTrash size={18} color="#FFD700" />
					</button>
				</div>
			</div>

			{loading ? <div style={{ padding: 12, opacity: 0.85 }}>Cargando...</div> : null}
			{error ? <div style={{ padding: 12, color: 'red' }}>{error}</div> : null}

			{map ? (
				<div style={{ padding: 12 }}>
					<div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) 1.2fr', gap: 14, alignItems: 'start' }}>
						<div>
							{imageUrl ? (
								<div
									className="metallic-border metallic-border-square map-card"
									style={{ width: '100%', height: 'auto', aspectRatio: '4 / 3', backgroundImage: 'none', overflow: 'hidden' }}
								>
									<CpImageFill src={imageUrl} alt={map.name} fit="cover" />
								</div>
							) : (
								<div className="block-border block-border-soft" style={{ padding: 12, opacity: 0.85 }}>
									Sin imagen.
								</div>
							)}
						</div>

						<div className="block-border block-border-soft" style={{ padding: 12 }}>
							<div style={{ fontWeight: 800, marginBottom: 6 }}>Descripción</div>
							<div style={{ whiteSpace: 'pre-wrap', opacity: 0.95 }}>{(map.description || '').trim() || '—'}</div>

							<div style={{ height: 10 }} />
							<div style={{ fontWeight: 800, marginBottom: 6 }}>Archivo</div>
							{fileUrl ? (
								<div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
									<FaExternalLinkAlt size={12} />
									<a href={fileUrl} target="_blank" rel="noreferrer" style={{ color: '#e2c044', textDecoration: 'underline', wordBreak: 'break-all' }}>
										{(map.file || '').trim()}
									</a>
								</div>
							) : (
								<div style={{ opacity: 0.9 }}>—</div>
							)}
						</div>
					</div>

					<div style={{ marginTop: 14 }} className="block-border block-border-soft">
						<div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
							<div style={{ fontWeight: 900 }}>Componentes del mapa</div>
							<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
								<button
									className="icon option"
									title={linkingEnabled ? 'Nuevo componente' : 'Habilita la vinculación para agregar'}
									aria-label="Nuevo componente"
									onClick={() => setComponentModalOpen(true)}
									disabled={!linkingEnabled}
								>
									<FaPlus size={16} />
								</button>
								<button
									className="icon option"
									title={linkingEnabled ? 'Deshabilitar vinculación' : 'Habilitar vinculación'}
									aria-label={linkingEnabled ? 'Deshabilitar vinculación' : 'Habilitar vinculación'}
									onClick={() => setLinkingEnabled((v) => !v)}
								>
									{linkingEnabled ? <FaLockOpen size={16} /> : <FaLock size={16} />}
								</button>
							</div>
						</div>

						<div style={{ padding: '0 12px 12px 12px' }}>
							<input
								type="text"
								placeholder="Buscar componente..."
								value={componentSearch}
								onChange={(e) => setComponentSearch(e.target.value)}
								className="filters-input"
								style={{ width: '100%', marginBottom: 8 }}
							/>

							<div style={{ maxHeight: 360, overflow: 'auto', paddingRight: 6 }}>
								{filteredComponents.map((c) => {
									const checked = componentIds.includes(c.id);
									return (
										<label key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0' }}>
											<input
												type="checkbox"
												checked={checked}
												disabled={!linkingEnabled}
												onChange={() => {
													if (!linkingEnabled) return;
													setComponentIds((prev) => (checked ? prev.filter((id) => id !== c.id) : prev.concat(c.id)));
												}}
											/>
											<div style={{ minWidth: 0 }}>
												<div style={{ fontWeight: 700, wordBreak: 'break-word' }}>{c.name}</div>
												<div style={{ opacity: 0.85, fontSize: 12 }}>{c.type}</div>
											</div>
										</label>
									);
								})}
								{filteredComponents.length === 0 ? <div style={{ opacity: 0.8, fontSize: 13 }}>No hay componentes.</div> : null}
							</div>
						</div>
					</div>
				</div>
			) : null}

			{editOpen && map ? (
				<MapModal
					open={editOpen}
					initial={map}
					existing={allMaps}
					onClose={() => setEditOpen(false)}
					onSubmit={async (formData) => {
						await updateMap(mapId, formData);
						setEditOpen(false);
						await refresh();
					}}
				/>
			) : null}

			{componentModalOpen ? (
				<ComponentModal
					open={componentModalOpen}
					existing={components}
					onClose={() => setComponentModalOpen(false)}
					onSubmit={async (formData) => {
						const created = await createComponent(formData);
						setComponents((prev) => (prev || []).concat(created));
						if (linkingEnabled) {
							setComponentIds((prev) => {
								const next = prev.includes(created.id) ? prev : prev.concat(created.id);
								// Link immediately (don’t wait for debounce).
								setMapComponents(mapId, next).catch((e) => console.error('Error vinculando componente al mapa', e));
								return next;
							});
						}
						setComponentModalOpen(false);
					}}
				/>
			) : null}

			<ConfirmModal
				open={confirmOpen}
				requireText="eliminar"
				message={'¿Estás seguro de que deseas eliminar este mapa?'}
				onConfirm={async () => {
					setConfirmOpen(false);
					if (!map) return;
					await deleteMap(map.id);
					onBack();
				}}
				onCancel={() => setConfirmOpen(false)}
			/>
		</div>
	);
};

export default MapDetail;
