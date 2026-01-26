import React, { useCallback, useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CpImage from '../components/CpImage';
import { getObject, getObjects as getAllObjects } from './gameObjectApi';
import { getAllCampaigns } from './campaignApi';
import { getAllChapters } from './chapterApi';
import { getObjectives } from './objectiveApi';
import { getEvents } from './eventApi';
import { getProfessions } from './professionApi';
import { getProfessionObjects } from './professionObjectApi';
import { ProfessionItem } from '../interfaces/profession';

interface Props {
	objectId: number;
	onBack: () => void;
}

const ObjectDetail: React.FC<Props> = ({ objectId, onBack }) => {
	const [object, setObject] = useState<any | null>(null);
	const [chapterUsages, setChapterUsages] = useState<Array<any>>([]);
	const [professionUsages, setProfessionUsages] = useState<Array<any>>([]);
	const [isWide, setIsWide] = useState(window.innerWidth >= 1000);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const onResize = () => setIsWide(window.innerWidth >= 1000);
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, []);

	const refresh = useCallback(async () => {
		setLoading(true);
		setObject(null);
		setChapterUsages([]);
		setProfessionUsages([]);
		try {
			const [obj, campaigns, chapters] = await Promise.all([
				getObject(objectId).catch(() => null),
				getAllCampaigns().catch(() => []),
				getAllChapters().catch(() => []),
			]);
			setObject(obj || null);

			const chapUses: Array<any> = [];

			// For each chapter, fetch its events, then objectives per event
			for (const ch of (chapters || [])) {
				try {
					const events = await getEvents({ chapterId: ch.id }).catch(() => []);
					for (const ev of (events || [])) {
						try {
							const objectives = await getObjectives({ eventId: ev.id }).catch(() => []);
							for (const objt of objectives || []) {
								let found = false;
								if (Array.isArray(objt.objectIds) && objt.objectIds.some((id: number) => id === objectId)) found = true;
								if (!found && Array.isArray((objt as any).objects) && (objt as any).objects.some((o: any) => Number(o?.id) === objectId)) found = true;
								if (found) {
									const camp = (campaigns || []).find((c: any) => c.id === ch.campaignId) || { id: ch.campaignId, name: '—' };
									chapUses.push({ campaignId: camp.id, campaignName: camp.name, chapterId: ch.id, chapterName: ch.name, eventId: ev.id, eventName: ev.name, objectiveId: objt.id, objectiveName: objt.name });
								}
							}
						} catch (err) {
							console.error('Error fetching objectives for event', ev?.id, err);
						}
					}
				} catch (err) {
					console.error('Error fetching events for chapter', ch?.id, err);
				}
			}

			// professions
			const professions = await getProfessions().catch(() => []);
			const objects = await getAllObjects().catch(() => []);
			const profMap: Record<number, { profession: ProfessionItem; objects: Array<{ objectId: number; objectName: string; quantity?: number }> }> = {};
			const profResults = await Promise.all((professions || []).map((p: any) => getProfessionObjects(p.id).then((m) => ({ p, m })).catch(() => ({ p, m: [] }))));
			for (const pr of profResults) {
				const p = pr.p as ProfessionItem;
				for (const link of pr.m || []) {
					if (link.objectId === objectId) {
						if (!profMap[p.id]) profMap[p.id] = { profession: p, objects: [] };
						profMap[p.id].objects.push({ objectId: link.objectId, objectName: (objects || []).find((o: any) => o.id === link.objectId)?.name || '—', quantity: link.quantity });
					}
				}
			}

			const profUsages = Object.values(profMap);

			chapUses.sort((a, b) => (a.campaignName || '').localeCompare(b.campaignName || '') || (a.chapterName || '').localeCompare(b.chapterName || '') || (a.eventName || '').localeCompare(b.eventName || ''));
			profUsages.sort((a, b) => (a.profession?.name || '').localeCompare(b.profession?.name || ''));

			setChapterUsages(chapUses);
			setProfessionUsages(profUsages);
		} catch (err) {
			console.error('Error cargando objeto/uso', err);
		} finally {
			setLoading(false);
		}
	}, [objectId]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const navigate = useNavigate();

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
						maxWidth: 'calc(100% - 120px)',
						padding: '6px 60px 8px 60px',
						minWidth: 0,
					}}
				>
					<div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.1 }}>Objeto</div>
					<div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>{object?.name || '—'}</div>
				</div>
			</div>

			<div style={{ padding: 12 }}>
				<div style={{ display: 'grid', gridTemplateColumns: isWide ? '1fr 1fr' : '1fr', gap: 12 }}>
					<div style={{ padding: 12, border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6 }}>
						<div style={{ display: 'flex', gap: 12 }}>
							<CpImage src={object?.icon ? (object.icon.startsWith('/') ? `http://localhost:4000/${object.icon.replace(/^\/+/, '')}` : object.icon) : undefined} width={80} height={80} fit="cover" />
							<div>
								<div style={{ fontWeight: 800, fontSize: 18 }}>{object?.name}</div>
								{object?.fileLink ? (
									<div style={{ marginTop: 6 }}>
										Archivo: <a href={object.fileLink}>{object.fileLink}</a>
									</div>
								) : null}
							</div>
						</div>
						{object?.description ? <div style={{ marginTop: 12 }}>{object.description}</div> : null}
					</div>

					<div style={{ padding: 12, border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6 }}>
						<div style={{ fontWeight: 800, marginBottom: 8 }}>Usos del objeto</div>
						<div style={{ marginBottom: 8, opacity: 0.9 }}>Eventos (por capítulo)</div>
						{loading ? (
							<div style={{ opacity: 0.8 }}>Cargando...</div>
						) : chapterUsages.length === 0 ? (
							<div style={{ opacity: 0.8 }}>No se utiliza en capítulos.</div>
						) : (
							<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
								{chapterUsages.map((u) => (
									<div key={`ch-${u.chapterId}-${u.eventId}`} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
										<div style={{ fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(`/campaigns/${u.campaignId}`)} title={`Ver campaña: ${u.campaignName}`}>{u.campaignName}</div>
												<div style={{ opacity: 0.9 }}>{'>'}</div>
												<div
													style={{ opacity: 0.9, cursor: 'pointer', textDecoration: 'underline' }}
													title={`Ver capítulo: ${u.chapterName}`}
													onClick={() => navigate(`/campaigns/${u.campaignId}/chapters/${u.chapterId}/events`)}
												>
													{u.chapterName}
												</div>
										<div style={{ opacity: 0.9 }}>{'>'}</div>
										<div
											style={{ opacity: 0.9, cursor: 'pointer', textDecoration: 'underline' }}
											title={`Ver evento: ${u.eventName}`}
											onClick={() => navigate(`/campaigns/${u.campaignId}/chapters/${u.chapterId}/events?eventId=${u.eventId}`)}
										>
											{u.eventName}
										</div>
										<div style={{ opacity: 0.75, marginLeft: 8 }}>{u.objectiveName ? (
											<span
												style={{ textDecoration: 'underline', cursor: 'pointer' }}
												title={`Ir al objetivo: ${u.objectiveName}`}
												onClick={() => navigate(`/campaigns/${u.campaignId}/chapters/${u.chapterId}/events?objectiveId=${u.objectiveId}`)}
											>{`(${u.objectiveName})`}</span>
										) : ''}</div>
									</div>
								))}
							</div>
						)}

						<div style={{ marginTop: 12, marginBottom: 8, opacity: 0.9 }}>Profesiones</div>
						{loading ? (
							<div style={{ opacity: 0.8 }}>Cargando...</div>
						) : professionUsages.length === 0 ? (
							<div style={{ opacity: 0.8 }}>No se utiliza en profesiones.</div>
						) : (
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
								{professionUsages.map((entry: any) => {
									const p = entry.profession as ProfessionItem;
									const objs = entry.objects as Array<any>;
									return (
										<div
											key={`prof-${p.id}`}
											className="block-border block-border-soft mechanic-card"
											style={{ padding: 12, cursor: 'pointer' }}
											onClick={() => navigate(`/professions/${p.id}`)}
										>
											<div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
												<div style={{ minWidth: 0 }}>
													<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
														<div style={{ fontWeight: 800, wordBreak: 'break-word' }}>{p.name}</div>
													</div>
													{p.description ? (
														<div style={{ marginTop: 6, opacity: 0.9, fontSize: 13, whiteSpace: 'pre-wrap' }}>{p.description}</div>
													) : null}
													{objs && objs.length > 0 ? (
														<div style={{ marginTop: 8, fontSize: 13 }}>
															<div style={{ fontWeight: 700, marginBottom: 6 }}>Objetos usados</div>
															<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
																{objs.map((o) => (
																	<div key={`po-${o.objectId}`} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
																		<div style={{ fontWeight: 700 }}>{o.objectName}</div>
																		<div style={{ opacity: 0.9 }}>{o.quantity ? `x${o.quantity}` : ''}</div>
																	</div>
																))}
															</div>
														</div>
													) : null}
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ObjectDetail;
