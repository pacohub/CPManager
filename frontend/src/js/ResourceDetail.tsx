import React, { useCallback, useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ProfessionItem } from '../interfaces/profession';
import CpImage from '../components/CpImage';
import { getResource } from './resourceApi';
import { getAllCampaigns } from './campaignApi';
import { getAllChapters } from './chapterApi';
import { getChapterResources } from './chapterResourceApi';
import { getProfessions } from './professionApi';
import { getProfessionObjectResourcesByProfession } from './professionObjectResourceApi';
import { getObjects } from './gameObjectApi';

interface Props {
    resourceId: number;
    onBack: () => void;
}

const ResourceDetail: React.FC<Props> = ({ resourceId, onBack }) => {
    const [resource, setResource] = useState<any | null>(null);
    const [usagesChapters, setUsagesChapters] = useState<Array<any>>([]);
    const [usagesProfessions, setUsagesProfessions] = useState<Array<any>>([]);
    const [professionsList, setProfessionsList] = useState<ProfessionItem[]>([]);
    const [isWide, setIsWide] = useState(window.innerWidth >= 1000);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const onResize = () => setIsWide(window.innerWidth >= 1000);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        setResource(null);
        setUsagesChapters([]);
        setUsagesProfessions([]);
        try {
            const [res, campaigns, chapters] = await Promise.all([
                getResource(resourceId).catch(() => null),
                getAllCampaigns().catch(() => []),
                getAllChapters().catch(() => []),
            ]);
            setResource(res || null);

            // chapters: fetch resources in parallel
            const chapterLists = await Promise.all((chapters || []).map((ch: any) => getChapterResources(ch.id).catch(() => [])));
            const chapterUsages: Array<any> = [];
            for (let i = 0; i < (chapters || []).length; i++) {
                const ch = (chapters || [])[i];
                const list = chapterLists[i] || [];
                if ((list || []).some((x: any) => x.id === resourceId)) {
                    const camp = (campaigns || []).find((c: any) => c.id === ch.campaignId) || { id: ch.campaignId, name: '—' };
                    chapterUsages.push({ campaignId: camp.id, campaignName: camp.name, chapterId: ch.id, chapterName: ch.name });
                }
            }

            const professions = await getProfessions().catch(() => []);
            setProfessionsList(professions || []);
            const objects = await getObjects().catch(() => []);

            // professions: fetch profession-object-resources in parallel
            const profResults = await Promise.all((professions || []).map((p: any) =>
                getProfessionObjectResourcesByProfession(p.id).then((m) => ({ p, m })).catch(() => ({ p, m: {} }))
            ));

            const profMap: Record<number, { profession: ProfessionItem; objects: Array<{ objectId: number; objectName: string; quantity?: number }> }> = {};
            for (const pr of profResults) {
                const p = pr.p as ProfessionItem;
                const map = pr.m as Record<string, any[]>;
                for (const [objIdStr, links] of Object.entries(map || {})) {
                    for (const link of links || []) {
                        if (link.resourceId === resourceId) {
                            const objId = Number(objIdStr);
                            const obj = (objects || []).find((o: any) => o.id === objId) || { id: objId, name: '—' };
                            if (!profMap[p.id]) profMap[p.id] = { profession: p as ProfessionItem, objects: [] };
                            profMap[p.id].objects.push({ objectId: obj.id, objectName: obj.name, quantity: link.quantity });
                        }
                    }
                }
            }

            const profUsages = Object.values(profMap);

            chapterUsages.sort((a, b) => (a.campaignName || '').localeCompare(b.campaignName || '') || (a.chapterName || '').localeCompare(b.chapterName || ''));
            profUsages.sort((a, b) => {
                const pa = (a.profession && a.profession.name) ? a.profession.name : '';
                const pb = (b.profession && b.profession.name) ? b.profession.name : '';
                const c = pa.localeCompare(pb);
                if (c !== 0) return c;
                const oa = (a.objects && a.objects[0] && a.objects[0].objectName) ? a.objects[0].objectName : '';
                const ob = (b.objects && b.objects[0] && b.objects[0].objectName) ? b.objects[0].objectName : '';
                return oa.localeCompare(ob);
            });

            setUsagesChapters(chapterUsages);
            setUsagesProfessions(profUsages);
        } catch (err) {
            console.error('Error cargando recurso/uso', err);
        } finally {
            setLoading(false);
        }
    }, [resourceId]);

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
                    <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.1 }}>Recurso</div>
                    <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>{resource?.name || '—'}</div>
                </div>
            </div>

            <div style={{ padding: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: isWide ? '1fr 1fr' : '1fr', gap: 12 }}>
                    <div style={{ padding: 12, border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6 }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <CpImage src={resource?.icon ? (resource.icon.startsWith('/') ? `http://localhost:4000/${resource.icon.replace(/^\/+/, '')}` : resource.icon) : undefined} width={80} height={80} fit="cover" />
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 18 }}>{resource?.name}</div>
                                {resource?.resourceType?.name ? <div style={{ marginTop: 6, opacity: 0.9 }}>{resource.resourceType.name}</div> : null}
                                {resource?.fileLink ? (
                                    <div style={{ marginTop: 6 }}>
                                        Archivo: <a href={resource.fileLink}>{resource.fileLink}</a>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        {resource?.description ? <div style={{ marginTop: 12 }}>{resource.description}</div> : null}
                    </div>

                    <div style={{ padding: 12, border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6 }}>
                        <div style={{ fontWeight: 800, marginBottom: 8 }}>Usos del recurso</div>
                        <div style={{ marginBottom: 8, opacity: 0.9 }}>Capítulos</div>
                        {loading ? (
                            <div style={{ opacity: 0.8 }}>Cargando...</div>
                        ) : usagesChapters.length === 0 ? (
                            <div style={{ opacity: 0.8 }}>No se utiliza en capítulos.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {usagesChapters.map((u) => (
                                    <div key={`ch-${u.chapterId}`} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <div style={{ fontWeight: 700 }}>{u.campaignName}</div>
                                        <div style={{ opacity: 0.9 }}>{'>'}</div>
                                        <div style={{ opacity: 0.9 }}>{u.chapterName}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ marginTop: 12, marginBottom: 8, opacity: 0.9 }}>Profesiones</div>
                        {loading ? (
                            <div style={{ opacity: 0.8 }}>Cargando...</div>
                        ) : usagesProfessions.length === 0 ? (
                            <div style={{ opacity: 0.8 }}>No se utiliza en profesiones.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                                {usagesProfessions.map((entry: any) => {
                                    const p = entry.profession as ProfessionItem;
                                    const objs = entry.objects as Array<any>;
                                    return (
                                        <div
                                            key={`prof-${p.id}`}
                                            className="block-border block-border-soft mechanic-card"
                                            style={{ padding: 12, cursor: 'pointer' }}
                                            onClick={() => navigate(`/professions/${p.id}`)}
                                        >
                                            {(!(p.description || '').trim()) ? (
                                                <span
                                                    className="campaign-warning"
                                                    title={`Falta: descripción.`}
                                                    aria-label="Faltan datos"
                                                    onClick={(e) => e.stopPropagation()}
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                >
                                                    {/* small warning icon could be added */}
                                                </span>
                                            ) : null}
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

export default ResourceDetail;
