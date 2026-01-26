import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaPaw, FaExclamation, FaArrowLeft, FaEdit, FaTrash, FaTimes, FaRunning } from 'react-icons/fa';
import { FaHandPaper } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import RaceModal from '../components/RaceModal';
import CpImage from '../components/CpImage';
import ClearableSearchInput from '../components/ClearableSearchInput';
import { AnimationItem } from '../interfaces/animation';
import { getSkills, createSkill } from './skillApi';
import SkillModal from '../components/SkillModal';
import { RaceItem } from '../interfaces/race';
import { SoundItem } from '../interfaces/sound';
import { createAnimation, getAnimations } from './animationApi';
import AnimationModal from '../components/AnimationModal';
import { createRace, deleteRace, getRaces, updateRace } from './raceApi';
import { getSounds } from './soundApi';

function asImageUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

function capitalizeFirst(raw?: string): string {
	const v = String(raw ?? '').trim();
	if (!v) return '';
	return v.charAt(0).toUpperCase() + v.slice(1);
}

interface Props { onBack: () => void }

const RacesView: React.FC<Props> = ({ onBack }) => {
	const [races, setRaces] = useState<RaceItem[]>([]);
	const [sounds, setSounds] = useState<SoundItem[]>([]);
	const [animations, setAnimations] = useState<AnimationItem[]>([]);
	const [skills, setSkills] = useState<any[]>([]);
	const [search, setSearch] = useState('');

	const [selectedRace, setSelectedRace] = useState<RaceItem | null>(null);

	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<RaceItem> | undefined>(undefined);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<RaceItem | null>(null);

	// association UI states (within selected race view)
	const [assocAddOpen, setAssocAddOpen] = useState(false);
	const [assocSelectedId, setAssocSelectedId] = useState<number | null>(null);
	const [assocRemoveOpen, setAssocRemoveOpen] = useState(false);
	const [assocToRemove, setAssocToRemove] = useState<any | null>(null);

	const [skillAssocAddOpen, setSkillAssocAddOpen] = useState(false);
	const [skillAssocSelectedId, setSkillAssocSelectedId] = useState<number | null>(null);
	const [skillAssocRemoveOpen, setSkillAssocRemoveOpen] = useState(false);
	const [skillToRemove, setSkillToRemove] = useState<any | null>(null);

	const [animationCreateOpen, setAnimationCreateOpen] = useState(false);
	const [skillCreateOpen, setSkillCreateOpen] = useState(false);

	const refresh = useCallback(async () => {
		const [r, s, a, k] = await Promise.all([
			getRaces().catch(() => [] as RaceItem[]),
			getSounds().catch(() => [] as SoundItem[]),
			getAnimations().catch(() => [] as AnimationItem[]),
			getSkills().catch(() => [] as any[]),
		]);
		setRaces(r || []);
		setSounds(s || []);
		setAnimations(a || []);
		setSkills((k as any) || []);
	}, []);

	useEffect(() => { refresh().catch(() => {}); }, [refresh]);

	const orderedAnimations = useMemo(() => (animations || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')), [animations]);
	const orderedSkills = useMemo(() => (skills || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')), [skills]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const list = q ? (races || []).filter((r) => (r.name || '').toLowerCase().includes(q)) : (races || []);
		return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
	}, [races, search]);

	async function handleDeleteRaceConfirm() {
		const t = pendingDelete;
		setConfirmOpen(false);
		setPendingDelete(null);
		if (!t) return;
		await deleteRace(t.id);
		await refresh();
	}

	// helpers to persist associations
	async function addAnimationToRace(r: RaceItem, animationId: number) {
		const existing = (r.animations || []).map((x: any) => x.id);
		if (!existing.includes(animationId)) existing.push(animationId);
		const updated = await updateRace(r.id, { animationIds: existing });
		setSelectedRace(updated);
		setRaces((prev) => (prev || []).map((it) => (it.id === updated.id ? updated : it)));
	}

	async function removeAnimationFromRace(r: RaceItem, animationId: number) {
		const remaining = (r.animations || []).map((x: any) => x.id).filter((id: any) => id !== animationId);
		const updated = await updateRace(r.id, { animationIds: remaining });
		setSelectedRace(updated);
		setRaces((prev) => (prev || []).map((it) => (it.id === updated.id ? updated : it)));
	}

	async function addSkillToRace(r: RaceItem, skillId: number) {
		const existing = (r.skills || []).map((x: any) => x.id);
		if (!existing.includes(skillId)) existing.push(skillId);
		const updated = await updateRace(r.id, { skillIds: existing });
		setSelectedRace(updated);
		setRaces((prev) => (prev || []).map((it) => (it.id === updated.id ? updated : it)));
	}

	async function removeSkillFromRace(r: RaceItem, skillId: number) {
		const remaining = (r.skills || []).map((x: any) => x.id).filter((id: any) => id !== skillId);
		const updated = await updateRace(r.id, { skillIds: remaining });
		setSelectedRace(updated);
		setRaces((prev) => (prev || []).map((it) => (it.id === updated.id ? updated : it)));
	}

	if (selectedRace) {
		const r = selectedRace;
		const iconUrl = asImageUrl(r.icon);
		return (
			<div className="panel panel-corners-soft block-border block-panel-border">
				<div className="panel-header" style={{ position: 'relative' }}>
					<button className="icon" onClick={() => setSelectedRace(null)} title="Volver">
						<FaArrowLeft size={22} color="#FFD700" />
					</button>
					<div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
						<div style={{ fontSize: 12, opacity: 0.85 }}>Raza</div>
						<div style={{ fontSize: 22, fontWeight: 900 }}>{r.name || '—'}</div>
					</div>
				</div>

				<div style={{ padding: 12 }}>
					<div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
						<CpImage src={iconUrl} width={96} height={96} fit="cover" />
						<div style={{ flex: 1 }}>
							<div style={{ fontWeight: 800 }}>{capitalizeFirst(r.armorType || r.armorTypeEntity?.name)}</div>
							<div style={{ marginTop: 8 }}>Vida base: {Number.isFinite(r.baseLife as any) ? r.baseLife : '-'}</div>
						</div>
					</div>

					{r.description ? (
						<div style={{ marginTop: 12, whiteSpace: 'pre-wrap', opacity: 0.95 }}>{r.description}</div>
					) : null}

					<div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
						<div className="block-border block-border-soft" style={{ padding: 12, flex: '1 1 360px' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<div style={{ fontWeight: 900 }}>Animaciones</div>
								<div>
									<button className="icon option" title="Asociar animación" onClick={() => { setAssocSelectedId(null); setAssocAddOpen(true); }}>
										<FaRunning size={16} color="#e2d9b7" />
									</button>
								</div>
							</div>

							{(r.animations || []).length === 0 ? (
								<div style={{ marginTop: 8, opacity: 0.85 }}>No hay animaciones asociadas.</div>
							) : (
								<div className="assoc-animations" style={{ marginTop: 8 }}>
									{(r.animations || []).map((a: any) => (
										<div key={a.id} className="assoc-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
											<div className="assoc-name">{a.name}</div>
														<div className="assoc-actions">
															<button className="icon option" onClick={() => { setAssocToRemove(a); setAssocRemoveOpen(true); }} title="Quitar asociación">
																<FaTrash size={14} />
															</button>
														</div>
										</div>
									))}
								</div>
							)}
						</div>

						<div className="block-border block-border-soft" style={{ padding: 12, flex: '1 1 360px' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<div style={{ fontWeight: 900 }}>Habilidades</div>
								<div>
									<button className="icon option" title="Asociar habilidad" onClick={() => { setSkillAssocSelectedId(null); setSkillAssocAddOpen(true); }}>
										<FaHandPaper size={16} color="#e2d9b7" />
									</button>
								</div>
							</div>

							{(r.skills || []).length === 0 ? (
								<div style={{ marginTop: 8, opacity: 0.85 }}>No hay habilidades asociadas.</div>
							) : (
								<div className="assoc-animations" style={{ marginTop: 8 }}>
									{(r.skills || []).map((s: any) => (
										<div key={s.id} className="assoc-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
											<div className="assoc-name">{s.name}</div>
											<div className="assoc-actions">
												<button className="icon option" onClick={() => { setSkillToRemove(s); setSkillAssocRemoveOpen(true); }} title="Quitar asociación">
													<FaTrash size={14} />
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Association modals and confirmers for selected race */}
				{assocAddOpen && (
					<div className="modal-overlay">
						<div className="modal-content" style={{ maxWidth: 520 }}>
							<button className="icon option" onClick={() => setAssocAddOpen(false)} style={{ position: 'absolute', top: 12, right: 12 }}><FaTimes /></button>
							<h3>Asociar animación</h3>
							<select value={assocSelectedId ?? ''} onChange={(e) => setAssocSelectedId(e.target.value ? Number(e.target.value) : null)} style={{ width: '100%' }}>
								<option value="">-- Seleccionar animación --</option>
								{orderedAnimations.filter((a) => !(r.animations || []).some((x: any) => x.id === a.id)).map((a) => (
									<option key={a.id} value={a.id}>{a.name}</option>
								))}
							</select>
							<div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
								<button className="confirm" onClick={async () => { if (!assocSelectedId) return; await addAnimationToRace(r, assocSelectedId); setAssocAddOpen(false); setAssocSelectedId(null); }}>Confirmar</button>
								<button className="cancel" onClick={() => { setAssocAddOpen(false); setAssocSelectedId(null); }}>Cancelar</button>
							</div>
						</div>
					</div>
				)}

				{animationCreateOpen && (
					<AnimationModal open={animationCreateOpen} existing={orderedAnimations} onClose={() => setAnimationCreateOpen(false)} onSubmit={async (data) => {
						try {
							const created = await createAnimation({ name: data.name });
							setAnimations((prev) => (prev || []).concat(created));
							setAnimationCreateOpen(false);
						} catch (e) { console.error(e); }
					}} />
				)}

				{assocRemoveOpen && (
					<ConfirmModal open={assocRemoveOpen} requireText={undefined} message={assocToRemove ? `¿Quitar la animación "${assocToRemove.name}" de la raza?` : '¿Quitar la animación?'} onConfirm={async () => { if (!assocToRemove) { setAssocRemoveOpen(false); return; } await removeAnimationFromRace(r, assocToRemove.id); setAssocToRemove(null); setAssocRemoveOpen(false); }} onCancel={() => { setAssocToRemove(null); setAssocRemoveOpen(false); }} />
				)}

				{skillAssocAddOpen && (
					<div className="modal-overlay">
						<div className="modal-content" style={{ maxWidth: 520 }}>
							<button className="icon option" onClick={() => setSkillAssocAddOpen(false)} style={{ position: 'absolute', top: 12, right: 12 }}><FaTimes /></button>
							<h3>Asociar habilidad</h3>
							<select value={skillAssocSelectedId ?? ''} onChange={(e) => setSkillAssocSelectedId(e.target.value ? Number(e.target.value) : null)} style={{ width: '100%' }}>
								<option value="">-- Seleccionar habilidad --</option>
								{orderedSkills.filter((s) => !(r.skills || []).some((x: any) => x.id === s.id)).map((s) => (
									<option key={s.id} value={s.id}>{s.name}</option>
								))}
							</select>
							<div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
								<button className="confirm" onClick={async () => { if (!skillAssocSelectedId) return; await addSkillToRace(r, skillAssocSelectedId); setSkillAssocAddOpen(false); setSkillAssocSelectedId(null); }}>Confirmar</button>
								<button className="cancel" onClick={() => { setSkillAssocAddOpen(false); setSkillAssocSelectedId(null); }}>Cancelar</button>
							</div>
						</div>
					</div>
				)}

				{skillCreateOpen && (
					<SkillModal open={skillCreateOpen} visuals={[]} onClose={() => setSkillCreateOpen(false)} onSubmit={async (data) => { try { const created: any = await createSkill(data); setSkills((prev) => (prev || []).concat(created)); setSkillCreateOpen(false); } catch (e) { console.error(e); } }} />
				)}

				{skillAssocRemoveOpen && (
					<ConfirmModal open={skillAssocRemoveOpen} requireText={undefined} message={skillToRemove ? `¿Quitar la habilidad "${skillToRemove.name}" de la raza?` : '¿Quitar la habilidad?'} onConfirm={async () => { if (!skillToRemove) { setSkillAssocRemoveOpen(false); return; } await removeSkillFromRace(r, skillToRemove.id); setSkillToRemove(null); setSkillAssocRemoveOpen(false); }} onCancel={() => { setSkillToRemove(null); setSkillAssocRemoveOpen(false); }} />
				)}
			</div>
		);
	}

	return (
		<div className="panel panel-corners-soft block-border block-panel-border">
			<div className="panel-header" style={{ position: 'relative' }}>
				<button className="icon" onClick={onBack} title="Volver"><FaArrowLeft size={22} color="#FFD700" /></button>
				<div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
					<div style={{ fontSize: 12, opacity: 0.85 }}>Listado</div>
					<div style={{ fontSize: 22, fontWeight: 900 }}>Razas</div>
				</div>
				<button className="icon" aria-label="Nueva Raza" title="Nueva Raza" onClick={() => { setInitial(undefined); setModalOpen(true); }}><FaPaw size={22} color="#FFD700" /></button>
			</div>

			<div className="filters-bar">
				<div className="filters-row">
					<ClearableSearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Buscar raza..." className="filters-input" />
				</div>
			</div>

			<div style={{ padding: 12 }}>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
					{filtered.map((r) => {
							const iconUrl = asImageUrl(r.icon);
							const missing: string[] = [];
							if (!iconUrl) missing.push('icono');
							if (!Number.isFinite(r.baseLife as any) || Number(r.baseLife) <= 0) missing.push('vida base');
							if ((r.animations || []).length === 0) missing.push('animaciones');
							if ((r.skills || []).length === 0) missing.push('habilidades');
							const showWarning = missing.length > 0;
							const warningText = `Falta: ${missing.join(', ')}.`;

						return (
							<div key={r.id} className="block-border block-border-soft mechanic-card" style={{ padding: 12, cursor: 'pointer', position: 'relative' }} onClick={() => setSelectedRace(r)}>
								{/* ...eliminado warning visual... */}
								<div style={{ display: 'flex', justifyContent: 'space-between' }}>
									<div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
										<CpImage src={asImageUrl(r.icon)} width={64} height={64} fit="cover" />
										<div>
											<div style={{ fontWeight: 900 }}>{r.name}</div>
											<div className="meta-small" style={{ marginTop: 4, opacity: 0.9 }}>Animaciones: {(r.animations || []).length}</div>
											<div className="meta-small" style={{ marginTop: 4, opacity: 0.9 }}>Habilidades: {(r.skills || []).length}</div>
										</div>
									</div>
									<div className="mechanic-actions" style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8 }}>
										<button className="icon option" title="Editar" onClick={(e) => { e.stopPropagation(); setInitial(r); setModalOpen(true); }}><FaEdit size={16} /></button>
										<button className="icon option" title="Eliminar" onClick={(e) => { e.stopPropagation(); setPendingDelete(r); setConfirmOpen(true); }}><FaTrash size={16} /></button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{modalOpen && (
				<RaceModal open={modalOpen} initial={initial} existing={races} sounds={sounds} onClose={() => { setModalOpen(false); setInitial(undefined); }} onSubmit={async (payload) => { if (initial?.id) await updateRace(initial.id as number, payload); else await createRace(payload); await refresh(); setModalOpen(false); setInitial(undefined); }} />
			)}

			<ConfirmModal open={confirmOpen} requireText="eliminar" message={'¿Estás seguro de que deseas eliminar esta raza?'} onConfirm={handleDeleteRaceConfirm} onCancel={() => { setConfirmOpen(false); setPendingDelete(null); }} />
		</div>
	);
};

export default RacesView;

