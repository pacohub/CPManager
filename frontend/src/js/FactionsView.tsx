import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { GiCrossedSwords } from 'react-icons/gi';
import ConfirmModal from '../components/ConfirmModal';
import FactionCard from '../components/FactionCard';
import FactionModal from '../components/FactionModal';
import { FactionItem } from '../interfaces/faction';
import { ProfessionItem } from '../interfaces/profession';
import { createFaction, deleteFaction, getFactionProfessions, getFactions, setFactionProfessions, updateFaction } from './factionApi';
import { getProfessions } from './professionApi';

interface Props {
	onBack: () => void;
}

const FactionsView: React.FC<Props> = ({ onBack }) => {
	const [factions, setFactions] = useState<FactionItem[]>([]);
	const [search, setSearch] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<FactionItem> | undefined>(undefined);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<FactionItem | null>(null);
	const [professionModalOpen, setProfessionModalOpen] = useState(false);
	const [professionSearch, setProfessionSearch] = useState('');
	const [professions, setProfessions] = useState<ProfessionItem[]>([]);
	const [professionFaction, setProfessionFaction] = useState<FactionItem | null>(null);
	const [selectedProfessionIds, setSelectedProfessionIds] = useState<number[]>([]);
	const [savingProfessions, setSavingProfessions] = useState(false);
	const [factionProfessions, setFactionProfessionsState] = useState<Record<number, ProfessionItem[]>>({});

	const refresh = useCallback(async () => {
		const list = await getFactions();
		setFactions(list || []);
	}, []);

	useEffect(() => {
		refresh().catch((e) => console.error('Error cargando facciones', e));
	}, [refresh]);

	useEffect(() => {
		getProfessions()
			.then((list) => setProfessions(list || []))
			.catch((e) => console.error('Error cargando profesiones', e));
	}, []);

	useEffect(() => {
		let cancelled = false;
		const list = factions || [];
		if (!list.length) {
			setFactionProfessionsState({});
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

		return () => {
			cancelled = true;
		};
	}, [factions]);

	const openProfessionsModal = useCallback(async (faction: FactionItem) => {
		setProfessionFaction(faction);
		setProfessionSearch('');
		setProfessionModalOpen(true);

		const cached = factionProfessions[faction.id];
		if (cached) {
			setSelectedProfessionIds((cached || []).map((p) => p.id));
			return;
		}
		try {
			const assigned = await getFactionProfessions(faction.id);
			setSelectedProfessionIds((assigned || []).map((p) => p.id));
		} catch (e) {
			console.error('Error cargando profesiones de facción', e);
			setSelectedProfessionIds([]);
		}
	}, [factionProfessions]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const list = q
			? (factions || []).filter((f) => (f.name || '').toLowerCase().includes(q) || (f.description || '').toLowerCase().includes(q))
			: (factions || []);
		return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [factions, search]);

	return (
		<div className="panel panel-corners-soft block-border block-panel-border">
			<div className="panel-header">
				<button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
					<FaArrowLeft size={22} color="#FFD700" />
				</button>
				<h1 style={{ margin: 0 }}>Facciones</h1>
				<button
					className="icon"
					aria-label="Nueva Facción"
					title="Nueva Facción"
					onClick={() => {
						setInitial(undefined);
						setModalOpen(true);
					}}
				>
					<GiCrossedSwords size={22} color="#FFD700" />
				</button>
			</div>

			<div style={{ display: 'flex', alignItems: 'center', padding: '0 12px 12px 12px' }}>
				<input
					type="text"
					placeholder="Buscar facción..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					style={{ flex: 1, padding: 8 }}
				/>
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
							onManageProfessions={() => openProfessionsModal(f)}
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

			{professionModalOpen && professionFaction ? (
				<div className="modal-overlay">
					<div className="modal-content" style={{ maxWidth: 640, minWidth: 360 }}>
						<h2 className="modal-title" style={{ marginTop: 0 }}>
							Profesiones de {professionFaction.name}
						</h2>

						<div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
							<input
								type="text"
								placeholder="Buscar profesión..."
								value={professionSearch}
								onChange={(e) => setProfessionSearch(e.target.value)}
								style={{ flex: 1, padding: 8 }}
							/>
						</div>

						<div style={{ maxHeight: 340, overflow: 'auto', paddingRight: 6 }}>
							{(professions || [])
								.slice()
								.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }))
								.filter((p) => {
									const q = professionSearch.trim().toLowerCase();
									if (!q) return true;
									return (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
								})
								.map((p) => {
									const checked = selectedProfessionIds.includes(p.id);
									return (
										<label key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0' }}>
											<input
												type="checkbox"
												checked={checked}
												onChange={() => {
													setSelectedProfessionIds((prev) =>
														checked ? prev.filter((id) => id !== p.id) : prev.concat(p.id),
													);
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

							{(professions || []).length === 0 ? (
								<div style={{ opacity: 0.85, color: '#e2d9b7' }}>No hay profesiones todavía.</div>
							) : null}
						</div>

						<div className="actions" style={{ marginTop: 12 }}>
							<button
								className="confirm"
								disabled={savingProfessions}
								onClick={async () => {
									setSavingProfessions(true);
									try {
										await setFactionProfessions(professionFaction.id, selectedProfessionIds);
										setFactionProfessionsState((prev) => {
											const next = { ...(prev || {}) };
											next[professionFaction.id] = (professions || []).filter((p) => selectedProfessionIds.includes(p.id));
											return next;
										});
										setProfessionModalOpen(false);
										setProfessionFaction(null);
									} finally {
										setSavingProfessions(false);
									}
								}}
							>
								Guardar
							</button>
							<button
								className="cancel"
								onClick={() => {
									setProfessionModalOpen(false);
									setProfessionFaction(null);
									setSelectedProfessionIds([]);
								}}
							>
								Cancelar
							</button>
						</div>
					</div>
				</div>
			) : null}

			<ConfirmModal
				open={confirmOpen}
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
