import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import { FaLockOpen, FaLock } from 'react-icons/fa';
import ClassModal from '../components/ClassModal';
import ProfessionModal from '../components/ProfessionModal';
import CpImage from '../components/CpImage';
import CpImageFill from '../components/CpImageFill';
import { ClassItem } from '../interfaces/class';
import { FactionItem } from '../interfaces/faction';
import { ProfessionItem } from '../interfaces/profession';
import { createClass, getClasses, uploadClassIcon } from './classApi';
import { getFaction, getFactionClasses, getFactionProfessions, setFactionClasses, setFactionProfessions } from './factionApi';
import { createProfession, getProfessions } from './professionApi';
import ClearableSearchInput from '../components/ClearableSearchInput';

function asImageUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

interface Props {
	factionId: number;
	onBack: () => void;
}

const FactionDetail: React.FC<Props> = ({ factionId, onBack }) => {
	const [faction, setFaction] = useState<FactionItem | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [professions, setProfessions] = useState<ProfessionItem[]>([]);
	const [classes, setClasses] = useState<ClassItem[]>([]);

	const [professionSearch, setProfessionSearch] = useState('');
	const [classSearch, setClassSearch] = useState('');

	const [selectedProfessionIds, setSelectedProfessionIds] = useState<number[]>([]);
	const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
	const didInitProfessions = useRef(false);
	const didInitClasses = useRef(false);
	const saveTokenProfRef = useRef(0);
	const saveTokenClassRef = useRef(0);
	const saveTimerProfRef = useRef<number | null>(null);
	const saveTimerClassRef = useRef<number | null>(null);
	const [linkingProfessionsEnabled, setLinkingProfessionsEnabled] = useState(false);
	const [linkingClassesEnabled, setLinkingClassesEnabled] = useState(false);
	const [professionModalOpen, setProfessionModalOpen] = useState(false);
	const [classModalOpen, setClassModalOpen] = useState(false);

	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [f, allProfessions, allClasses, assignedProfessions, assignedClasses] = await Promise.all([
				getFaction(factionId),
				getProfessions(),
				getClasses(),
				getFactionProfessions(factionId),
				getFactionClasses(factionId),
			]);
			setFaction(f);
			setProfessions(allProfessions || []);
			setClasses(allClasses || []);
			setSelectedProfessionIds((assignedProfessions || []).map((p) => p.id));
			setSelectedClassIds((assignedClasses || []).map((c) => c.id));
			didInitProfessions.current = true;
			didInitClasses.current = true;
		} catch (e: any) {
			console.error('Error cargando detalle de facción', e);
			setError(e?.message || 'Error cargando datos.');
			setFaction(null);
			setProfessions([]);
			setClasses([]);
			setSelectedProfessionIds([]);
			setSelectedClassIds([]);
		} finally {
			setLoading(false);
		}
	}, [factionId]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	useEffect(() => {
		// Auto-save profession linkage (debounced) after initial load.
		if (!didInitProfessions.current) return;
		if (saveTimerProfRef.current) window.clearTimeout(saveTimerProfRef.current);
		const token = ++saveTokenProfRef.current;
		saveTimerProfRef.current = window.setTimeout(async () => {
			try {
				await setFactionProfessions(factionId, selectedProfessionIds);
			} catch (e) {
				console.error('Error guardando profesiones de facción', e);
			} finally {
				if (saveTokenProfRef.current !== token) return;
			}
		}, 350);
		return () => {
			if (saveTimerProfRef.current) window.clearTimeout(saveTimerProfRef.current);
		};
	}, [factionId, selectedProfessionIds]);

	useEffect(() => {
		// Auto-save class linkage (debounced) after initial load.
		if (!didInitClasses.current) return;
		if (saveTimerClassRef.current) window.clearTimeout(saveTimerClassRef.current);
		const token = ++saveTokenClassRef.current;
		saveTimerClassRef.current = window.setTimeout(async () => {
			try {
				await setFactionClasses(factionId, selectedClassIds);
			} catch (e) {
				console.error('Error guardando clases de facción', e);
			} finally {
				if (saveTokenClassRef.current !== token) return;
			}
		}, 350);
		return () => {
			if (saveTimerClassRef.current) window.clearTimeout(saveTimerClassRef.current);
		};
	}, [factionId, selectedClassIds]);

	const filteredProfessions = useMemo(() => {
		const q = professionSearch.trim().toLowerCase();
		const selected = new Set(selectedProfessionIds);
		const list = (professions || [])
			.slice()
			.sort((a, b) => {
				const aSelected = selected.has(a.id);
				const bSelected = selected.has(b.id);
				if (aSelected !== bSelected) return aSelected ? -1 : 1;
				return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
			});
		if (!q) return list;
		return list.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
	}, [professions, selectedProfessionIds, professionSearch]);

	const filteredClasses = useMemo(() => {
		const q = classSearch.trim().toLowerCase();
		const selected = new Set(selectedClassIds);
		const list = (classes || [])
			.slice()
			.sort((a, b) => {
				const aSelected = selected.has(a.id);
				const bSelected = selected.has(b.id);
				if (aSelected !== bSelected) return aSelected ? -1 : 1;
				return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
			});
		if (!q) return list;
		return list.filter((c) => (c.name || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q));
	}, [classes, selectedClassIds, classSearch]);

	const crestUrl = useMemo(() => asImageUrl(faction?.crestImage), [faction?.crestImage]);
	const iconUrl = useMemo(() => asImageUrl(faction?.iconImage), [faction?.iconImage]);

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
						maxWidth: 'calc(100% - 140px)',
						padding: '6px 70px 8px 70px',
						minWidth: 0,
					}}
				>
					<div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.1 }}>Facción</div>
					<div
						style={{
							fontSize: 22,
							fontWeight: 900,
							lineHeight: 1.1,
							minWidth: 0,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{faction?.name ?? (loading ? '...' : '(No encontrada)')}
					</div>
					</div>
				<div style={{ width: 32 }} />
			</div>

			{error ? (
				<div style={{ padding: 12, color: 'red' }}>{error}</div>
			) : null}

			{loading ? (
				<div style={{ padding: 12, opacity: 0.9, color: '#e2d9b7' }}>Cargando...</div>
			) : null}

			{!loading && faction ? (
				<div style={{ padding: 12 }}>
					{crestUrl ? (
						<div
							className="metallic-border map-card"
							style={{
								width: '100%',
								height: 'auto',
								aspectRatio: '16 / 5',
								position: 'relative',
								overflow: 'hidden',
							}}
						>
							<div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
								<CpImageFill src={crestUrl} alt={faction.name} fit="cover" />
							</div>
							<div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1 }} />
							<div
								style={{
									position: 'relative',
									zIndex: 2,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									padding: 14,
									textAlign: 'center',
									gap: 10,
								}}
							>
								<CpImage src={iconUrl} width={84} height={84} fit="cover" />
								<div style={{ fontWeight: 900, fontSize: 20, color: '#e2d9b7' }}>{faction.name}</div>
								<div style={{ maxWidth: 720, opacity: 0.95, color: '#e2d9b7', whiteSpace: 'pre-wrap' }}>
									{(faction.description || '').trim() || '—'}
								</div>
							</div>
						</div>
					) : (
						<div className="block-border block-border-soft" style={{ padding: 12, opacity: 0.9 }}>
							<div style={{ fontWeight: 900, fontSize: 18 }}>{faction.name}</div>
							<div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{(faction.description || '').trim() || '—'}</div>
						</div>
					)}

					<div style={{ height: 12 }} />

					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 12, alignItems: 'start' }}>
						<div className="block-border block-border-soft">
							<div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
								<div style={{ fontWeight: 900 }}>Profesiones</div>
								<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
									<button
										className="icon option"
										title={'Nueva profesión'}
										aria-label="Nueva profesión"
										onClick={() => setProfessionModalOpen(true)}
									>
										<FaPlus size={16} />
									</button>
									<button
										className="icon option"
										title={linkingProfessionsEnabled ? 'Deshabilitar selección' : 'Habilitar selección'}
										aria-label={linkingProfessionsEnabled ? 'Deshabilitar selección' : 'Habilitar selección'}
										onClick={() => setLinkingProfessionsEnabled((v) => !v)}
									>
										{linkingProfessionsEnabled ? <FaLockOpen size={16} /> : <FaLock size={16} />}
									</button>
								</div>
							</div>

							<div style={{ padding: '0 12px 12px 12px' }}>
								<ClearableSearchInput
									value={professionSearch}
									onChange={(v) => setProfessionSearch(v)}
									placeholder="Buscar profesión..."
									className="filters-input"
									style={{ width: '100%', marginBottom: 8 }}
								/>

								<div style={{ maxHeight: 420, overflow: 'auto', paddingRight: 6 }}>
									{filteredProfessions.map((p) => {
										const checked = selectedProfessionIds.includes(p.id);
										return (
											<label key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0' }}>
												<input
													type="checkbox"
													checked={checked}
													disabled={!linkingProfessionsEnabled}
													onChange={() => {
													if (!linkingProfessionsEnabled) return;
													setSelectedProfessionIds((prev) => (checked ? prev.filter((id) => id !== p.id) : prev.concat(p.id)));
												}}
												/>
												<div style={{ minWidth: 0 }}>
													<div style={{ fontWeight: 700, wordBreak: 'break-word' }}>{p.name}</div>
													{p.description ? (
														<div style={{ opacity: 0.9, fontSize: 13, whiteSpace: 'pre-wrap' }}>{p.description}</div>
													) : null}
												</div>
											</label>
										);
									})}
									{filteredProfessions.length === 0 ? <div style={{ opacity: 0.8, fontSize: 13 }}>No hay profesiones.</div> : null}
								</div>
							</div>
						</div>

						<div className="block-border block-border-soft">
							<div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
								<div style={{ fontWeight: 900 }}>Clases</div>
								<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
									<button
										className="icon option"
										title={'Nueva clase'}
										aria-label="Nueva clase"
										onClick={() => setClassModalOpen(true)}
									>
										<FaPlus size={16} />
									</button>
									<button
										className="icon option"
										title={linkingClassesEnabled ? 'Deshabilitar selección' : 'Habilitar selección'}
										aria-label={linkingClassesEnabled ? 'Deshabilitar selección' : 'Habilitar selección'}
										onClick={() => setLinkingClassesEnabled((v) => !v)}
									>
										{linkingClassesEnabled ? <FaLockOpen size={16} /> : <FaLock size={16} />}
									</button>
								</div>
							</div>

							<div style={{ padding: '0 12px 12px 12px' }}>
								<ClearableSearchInput
									value={classSearch}
									onChange={(v) => setClassSearch(v)}
									placeholder="Buscar clase..."
									className="filters-input"
									style={{ width: '100%', marginBottom: 8 }}
								/>

								<div style={{ maxHeight: 420, overflow: 'auto', paddingRight: 6 }}>
									{filteredClasses.map((c) => {
										const checked = selectedClassIds.includes(c.id);
										return (
											<label key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0' }}>
												<input
													type="checkbox"
													checked={checked}
													disabled={!linkingClassesEnabled}
													onChange={() => {
													if (!linkingClassesEnabled) return;
													setSelectedClassIds((prev) => (checked ? prev.filter((id) => id !== c.id) : prev.concat(c.id)));
												}}
												/>
												<div style={{ minWidth: 0 }}>
													<div style={{ fontWeight: 700, wordBreak: 'break-word' }}>{c.name}</div>
													<div style={{ opacity: 0.9, fontSize: 13 }}>Nivel: {Number.isFinite(c.level as any) ? Number(c.level) : 1}</div>
													{c.description ? (
														<div style={{ opacity: 0.9, fontSize: 13, whiteSpace: 'pre-wrap' }}>{c.description}</div>
													) : null}
												</div>
											</label>
										);
									})}
									{filteredClasses.length === 0 ? <div style={{ opacity: 0.8, fontSize: 13 }}>No hay clases.</div> : null}
								</div>
							</div>
						</div>
					</div>
				</div>
			) : null}

			{professionModalOpen ? (
				<ProfessionModal
					open={professionModalOpen}
					existing={professions}
					onClose={() => setProfessionModalOpen(false)}
					onSubmit={async (data) => {
						const created = await createProfession(data);
						setProfessions((prev) => (prev || []).concat(created));
						setSelectedProfessionIds((prev) => (prev.includes(created.id) ? prev : prev.concat(created.id)));
						setProfessionModalOpen(false);
					}}
				/>
			) : null}

			{classModalOpen ? (
				<ClassModal
					open={classModalOpen}
					existing={classes}
					onClose={() => setClassModalOpen(false)}
					onSubmit={async (data) => {
						const anyData = data as any;
						const iconFile: File | null | undefined = anyData?.iconFile;
						let icon = (data.icon || '').trim();
						if (iconFile) {
							const uploaded = await uploadClassIcon(iconFile);
							if (uploaded) icon = uploaded;
						}
						const { iconFile: _ignored, ...rest } = anyData;
						const created = await createClass({ ...rest, icon } as any);
						setClasses((prev) => (prev || []).concat(created));
						setSelectedClassIds((prev) => (prev.includes(created.id) ? prev : prev.concat(created.id)));
						setClassModalOpen(false);
					}}
				/>
			) : null}
		</div>
	);
};

export default FactionDetail;
