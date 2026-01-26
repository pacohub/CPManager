
// @ts-nocheck
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
import { getAllCampaigns } from './campaignApi';
import { getChapterFactionsByCampaign } from './chapterFactionApi';
import { getChaptersByCampaign } from './chapterApi';
import { useNavigate } from 'react-router-dom';
import ClearableSearchInput from '../components/ClearableSearchInput';

// --- Accordion component ---
function UsosFaccionAccordion(props) {
	const { usages, navigate } = props;
	const [open, setOpen] = useState({});
	const toggle = (id) => setOpen(prev => ({ ...prev, [id]: !prev[id] }));
	return (
		<div>
			{usages.map((u) => (
				<div key={u.campaign.id} style={{ marginBottom: 8 }}>
					<div style={{ cursor: 'pointer', fontWeight: 800, userSelect: 'none' }} onClick={() => toggle(u.campaign.id)}>
						{u.campaign.name} {open[u.campaign.id] ? '▼' : '▶'}
					</div>
					{open[u.campaign.id] && (
						<ul style={{ margin: '6px 0 0 18px', padding: 0, listStyle: 'disc' }}>
							{u.chapters.map((ch) => (
								<li key={ch.id} style={{ marginBottom: 2 }}>
									<a
										href="#"
										onClick={e => {
											e.preventDefault();
											navigate(`/campaigns/${u.campaign.id}/chapters/${ch.id}/events`);
										}}
										style={{ color: '#e2d9b7', textDecoration: 'underline', cursor: 'pointer' }}
									>
										{ch.name}
									</a>
								</li>
							))}
						</ul>
					)}
				</div>
			))}
		</div>
	);
}

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
	const [usages, setUsages] = useState<any[]>([]);

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

	const navigate = useNavigate();

	useEffect(() => {
		 let cancelled = false;
		 const computeUsages = async () => {
			 if (!faction) return;
			 try {
				 const campaigns = await getAllCampaigns();
				 const out: any[] = [];
				 await Promise.all(campaigns.map(async (c) => {
					 try {
						 const byChapter = await getChapterFactionsByCampaign(c.id!);
						 const chapters = await getChaptersByCampaign(c.id!);
						 const matched = chapters.filter((ch) => {
							 const links = byChapter[ch.id as number] || [];
							 return links.some((l) => l.factionId === faction.id);
						 });
						 if (matched.length) out.push({ campaign: c, chapters: matched });
					 } catch (e) {
						 console.error('Error computing faction usages for campaign', c.id, e);
					 }
				 }));
				 if (!cancelled) setUsages(out);
			 } catch (e) {
				 console.error('Error computing faction usages', e);
			 }
		 };
		 computeUsages();
		 return () => {
			 cancelled = true;
		 };
	}, [faction]);

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
		let list = (professions || [])
			.slice()
			.sort((a, b) => {
				const aSelected = selected.has(a.id);
				const bSelected = selected.has(b.id);
				if (aSelected !== bSelected) return aSelected ? -1 : 1;
				return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
			});
		// Solo mostrar asociadas si el candado está cerrado
		if (!linkingProfessionsEnabled) {
			list = list.filter((p) => selected.has(p.id));
		}
		if (!q) return list;
		return list.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
	}, [professions, selectedProfessionIds, professionSearch, linkingProfessionsEnabled]);

	const filteredClasses = useMemo(() => {
		const q = classSearch.trim().toLowerCase();
		const selected = new Set(selectedClassIds);
		let list = (classes || [])
			.slice()
			.sort((a, b) => {
				const aSelected = selected.has(a.id);
				const bSelected = selected.has(b.id);
				if (aSelected !== bSelected) return aSelected ? -1 : 1;
				return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
			});
		// Solo mostrar asociadas si el candado está cerrado
		if (!linkingClassesEnabled) {
			list = list.filter((c) => selected.has(c.id));
		}
		if (!q) return list;
		return list.filter((c) => (c.name || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q));
	}, [classes, selectedClassIds, classSearch, linkingClassesEnabled]);

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
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
								marginTop: 2,
							}}
						>
							{faction?.name ?? (loading ? '...' : '(No encontrada)')}
						</div>
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
					{iconUrl ? (
						<div
							className="metallic-border map-card"
							style={{
								width: '100%',
								height: 'auto',
								aspectRatio: '16 / 5',
								position: 'relative',
								overflow: 'visible',
								borderRadius: 0,
								background: '#181818',
								padding: 0,
							}}
						>
							<div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
								<CpImageFill src={iconUrl} alt={faction.name} fit="cover" />
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
								{crestUrl && (
									<CpImage src={crestUrl} width={84} height={84} fit="cover" showFrame={false} imgStyle={{ borderRadius: 0, background: 'transparent' }} />
								)}
								<div style={{
									maxWidth: 720,
									opacity: 0.95,
									color: '#e2d9b7',
									whiteSpace: 'pre-wrap',
									overflow: 'visible',
									maxHeight: 'none',
									height: 'auto',
								}}>
									{(faction.description || '').trim() || '—'}
								</div>
							</div>
						</div>
					) : (
						<div className="block-border block-border-soft" style={{ padding: 12, opacity: 0.9 }}>
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

								<div className="cp-scrollbar" style={{ maxHeight: 420, overflow: 'auto', paddingRight: 6 }}>
									<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
										{filteredProfessions.map((p) => {
											const checked = selectedProfessionIds.includes(p.id);
											const iconUrl = asImageUrl(p.icon);
											return (
												<div
													key={p.id}
													className="block-border block-border-soft mechanic-card"
													style={{ padding: 12, cursor: linkingProfessionsEnabled ? 'pointer' : 'default', position: 'relative', opacity: !linkingProfessionsEnabled && !checked ? 0.6 : 1 }}
													onClick={() => {
														if (!linkingProfessionsEnabled) return;
														setSelectedProfessionIds((prev) => (checked ? prev.filter((id) => id !== p.id) : prev.concat(p.id)));
													}}
													tabIndex={0}
												>
													<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
														<CpImage src={iconUrl} width={64} height={64} fit="cover" />
														<div style={{ flex: 1 }}>
															<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
																<div style={{ fontWeight: 800 }}>{(p.name || '').trim() || '—'}</div>
																<input
																	type="checkbox"
																	checked={checked}
																	disabled={!linkingProfessionsEnabled}
																	onChange={e => {
																		e.stopPropagation();
																		if (!linkingProfessionsEnabled) return;
																		setSelectedProfessionIds((prev) => (checked ? prev.filter((id) => id !== p.id) : prev.concat(p.id)));
																	}}
																	style={{ marginLeft: 8 }}
																/>
															</div>
															<div style={{ marginTop: 8, fontSize: 13, opacity: 0.9, whiteSpace: 'pre-wrap' }}>{p.description || ''}</div>
														</div>
													</div>
												</div>
											);
										})}
									</div>
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

								<div className="cp-scrollbar" style={{ maxHeight: 420, overflow: 'auto', paddingRight: 6 }}>
									<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
										{filteredClasses.map((c) => {
											const checked = selectedClassIds.includes(c.id);
											const iconUrl = asImageUrl(c.icon);
											return (
												<div
													key={c.id}
													className="block-border block-border-soft mechanic-card"
													style={{ padding: 12, cursor: linkingClassesEnabled ? 'pointer' : 'default', position: 'relative', opacity: !linkingClassesEnabled && !checked ? 0.6 : 1 }}
													onClick={() => {
														if (!linkingClassesEnabled) return;
														setSelectedClassIds((prev) => (checked ? prev.filter((id) => id !== c.id) : prev.concat(c.id)));
													}}
													tabIndex={0}
												>
													<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
														<CpImage src={iconUrl} width={64} height={64} fit="cover" />
														<div style={{ flex: 1 }}>
															<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
																<div style={{ fontWeight: 800 }}>{(c.name || '').trim() || '—'}</div>
																<input
																	type="checkbox"
																	checked={checked}
																	disabled={!linkingClassesEnabled}
																	onChange={e => {
																		e.stopPropagation();
																		if (!linkingClassesEnabled) return;
																		setSelectedClassIds((prev) => (checked ? prev.filter((id) => id !== c.id) : prev.concat(c.id)));
																	}}
																	style={{ marginLeft: 8 }}
																/>
															</div>
															<div style={{ marginTop: 4, fontSize: 13, opacity: 0.9 }}>Nivel: {Number.isFinite(c.level as any) ? Number(c.level) : 1}</div>
															<div style={{ marginTop: 4, fontSize: 13, opacity: 0.9, whiteSpace: 'pre-wrap' }}>{c.description || ''}</div>
														</div>
													</div>
												</div>
											);
										})}
									</div>
									{filteredClasses.length === 0 ? <div style={{ opacity: 0.8, fontSize: 13 }}>No hay clases.</div> : null}
								</div>
							</div>
						</div>
					</div>
				</div>
			) : null}

				{usages ? (
					<div className="block-border block-border-soft" style={{ padding: 12, marginTop: 24 }}>
						<div style={{ fontWeight: 900, marginBottom: 8 }}>Usos de la facción</div>
						{usages.length === 0 ? (
							<div style={{ opacity: 0.85 }}>No hay usos de esta facción en campañas.</div>
						) : (
							<UsosFaccionAccordion usages={usages} navigate={navigate} />
						)}
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
