import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaFlag } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import FactionCard from '../components/FactionCard';
import FactionModal from '../components/FactionModal';
import CpImage from '../components/CpImage';
import ClearableSearchInput from '../components/ClearableSearchInput';
import { ClassItem } from '../interfaces/class';
import { FactionItem } from '../interfaces/faction';
import { ProfessionItem } from '../interfaces/profession';
import { createFaction, deleteFaction, getFactionClasses, getFactionProfessions, getFactions, updateFaction } from './factionApi';

const toBackendUrl = (path?: string) => {
	if (!path) return undefined;
	if (path.startsWith('http') || path.startsWith('data:')) return path;
	return encodeURI(`http://localhost:4000/${path.replace(/^\/+/, '')}`);
};

interface Props {
	 onBack: () => void;
	 onOpenFaction?: (id: number) => void;
}

const FactionsView: React.FC<Props> = ({ onBack, onOpenFaction }) => {
	 const [factions, setFactions] = useState<FactionItem[]>([]);
	 const [search, setSearch] = useState('');
	 const [modalOpen, setModalOpen] = useState(false);
	 const [initial, setInitial] = useState<Partial<FactionItem> | undefined>(undefined);
	 const [confirmOpen, setConfirmOpen] = useState(false);
	 const [pendingDelete, setPendingDelete] = useState<FactionItem | null>(null);
	 const [factionProfessions, setFactionProfessionsState] = useState<Record<number, ProfessionItem[]>>({});
	 const [factionClasses, setFactionClassesState] = useState<Record<number, ClassItem[]>>({});
	 const [selectedFaction, setSelectedFaction] = useState<FactionItem | null>(null);

	 const refresh = useCallback(async () => {
		 const list = await getFactions();
		 setFactions(list || []);
	 }, []);

	 useEffect(() => {
		 refresh().catch((e) => console.error('Error cargando facciones', e));
	 }, [refresh]);

	 useEffect(() => {
		 let cancelled = false;
		 const list = factions || [];
		 if (!list.length) {
			 setFactionProfessionsState({});
			 setFactionClassesState({});
			 return;
		 }

		 Promise.allSettled(list.map((f) => getFactionProfessions(f.id))).then((results) => {
			 if (cancelled) return;
			 const next: Record<number, ProfessionItem[]> = {};
			 results.forEach((r, idx) => {
				 const factionId = list[idx]?.id;
				 if (!factionId) return;
				 if (r.status === 'fulfilled') next[factionId] = r.value || [];
				 else next[factionId] = [];
			 });
			 setFactionProfessionsState(next);
		 });

		 Promise.allSettled(list.map((f) => getFactionClasses(f.id))).then((results) => {
			 if (cancelled) return;
			 const next: Record<number, ClassItem[]> = {};
			 results.forEach((r, idx) => {
				 const factionId = list[idx]?.id;
				 if (!factionId) return;
				 if (r.status === 'fulfilled') next[factionId] = r.value || [];
				 else next[factionId] = [];
			 });
			 setFactionClassesState(next);
		 });

		 return () => {
			 cancelled = true;
		 };
	 }, [factions]);

	 const filtered = useMemo(() => {
		 const q = search.trim().toLowerCase();
		 const list = q
			 ? (factions || []).filter((f) => (f.name || '').toLowerCase().includes(q) || (f.description || '').toLowerCase().includes(q))
			 : (factions || []);
		 return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	 }, [factions, search]);

	 if (selectedFaction) {
		 const f = selectedFaction;
		 const iconUrl = toBackendUrl(f.iconImage);
		 const crestUrl = toBackendUrl(f.crestImage);
		 return (
			 <div className="panel panel-corners-soft block-border block-panel-border">
				 <div className="panel-header" style={{ position: 'relative' }}>
					 <button className="icon" onClick={() => setSelectedFaction(null)} title="Volver" aria-label="Volver">
						 <FaArrowLeft size={22} color="#FFD700" />
					 </button>
					 <div
						 style={{
							 position: 'absolute',
							 zIndex: 30,
							 pointerEvents: 'none',
							 left: '50%',
							 transform: 'translateX(-50%)',
							 top: 0,
							 bottom: 0,
							 display: 'flex',
							 flexDirection: 'column',
							 alignItems: 'center',
							 justifyContent: 'center',
							 textAlign: 'center',
							 maxWidth: 'calc(100% - 160px)',
							 padding: '6px 80px 8px 80px',
							 minWidth: 0,
						 }}
					 >
						 <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.1 }}>Facción</div>
						 <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>{(f.name || '').trim() || '—'}</div>
					 </div>
					 <div style={{ width: 40 }} />
				 </div>

				 {/* Hero area: faction image background with centered crest */}
				 <div className={`faction-hero ${crestUrl ? 'has-crest' : ''}`} style={{ backgroundImage: iconUrl ? `url(${iconUrl})` : 'none' }}>
					{crestUrl ? (
						<div className="faction-crest-large" aria-hidden>
							<CpImage src={crestUrl} width={160} height={160} fit="cover" showFrame={false} imgStyle={{ borderRadius: 8, width: '100%', height: '100%' }} />
						</div>
					) : null}
				 </div>

				 <div style={{ padding: 12 }}>
					 <div className="block-border block-border-soft" style={{ padding: 12 }}>
						 <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>Descripción</div>
						 <div style={{ whiteSpace: 'pre-wrap', opacity: 0.95 }}>{(f.description || '').trim() || '-'}</div>
					 </div>
				 </div>
			 </div>
		 );
	 }

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
						 maxWidth: 'calc(100% - 160px)',
						 padding: '6px 80px 8px 80px',
						 minWidth: 0,
					 }}
				 >
					 <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.1 }}>Listado</div>
					 <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>Facciones</div>
				 </div>
				 <button
					 className="icon"
					 aria-label="Nueva Facción"
					 title="Nueva Facción"
					 onClick={() => {
						 setInitial(undefined);
						 setModalOpen(true);
					 }}
				 >
					 <FaFlag size={22} color="#FFD700" />
				 </button>
			 </div>

				<div className="filters-bar">
					<div className="filters-row">
						<ClearableSearchInput
							value={search}
							onChange={(v) => setSearch(v)}
							placeholder="Buscar facción..."
							className="filters-input"
						/>
					</div>
				</div>
			 {search.trim() ? (
				 <div style={{ marginTop: -8, marginBottom: 16, opacity: 0.9, fontSize: 13, padding: '0 12px' }}>
					 Resultados: {filtered.length}
				 </div>
			 ) : null}

			 <div style={{ padding: 12 }}>
				 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
					 {filtered.map((f) => (
						 <FactionCard
							 key={f.id}
							 faction={f}
							 professions={factionProfessions[f.id] || []}
							 classes={factionClasses[f.id] || []}
							 onOpen={() => setSelectedFaction(f)}
							 onRemoveCrest={async () => {
								 try {
									 const fd = new FormData();
									 fd.append('crestImage', '');
									 await updateFaction(f.id, fd);
									 await refresh();
								 } catch (e) {
									 console.error('Error eliminando escudo', e);
									 window.alert(String(e));
								 }
							 }}
							 onEdit={() => {
								 setInitial(f);
								 setModalOpen(true);
							 }}
							 onDelete={() => {
								 setPendingDelete(f);
								 setConfirmOpen(true);
							 }}
							 />
					 ))}
				 </div>

				 {filtered.length === 0 ? (
					 <div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay facciones todavía.</div>
				 ) : null}
			 </div>

			 {modalOpen ? (
				 <FactionModal
					 open={modalOpen}
					 initial={initial}
					 existing={factions}
					 onClose={() => {
						 setModalOpen(false);
						 setInitial(undefined);
					 }}
					 onSubmit={async (formData) => {
						 if (initial?.id) await updateFaction(initial.id, formData);
						 else await createFaction(formData);
						 await refresh();
						 setModalOpen(false);
						 setInitial(undefined);
					 }}
					 />
			 ) : null}

			 <ConfirmModal
				 open={confirmOpen}
				 requireText="eliminar"
				 message={'¿Estás seguro de que deseas eliminar esta facción?'}
				 onConfirm={async () => {
					 const target = pendingDelete;
					 setConfirmOpen(false);
					 setPendingDelete(null);
					 if (!target) return;
					 await deleteFaction(target.id);
					 await refresh();
				 }}
				 onCancel={() => {
					 setConfirmOpen(false);
					 setPendingDelete(null);
				 }}
				 />
		 </div>
	 );
};

export default FactionsView;
