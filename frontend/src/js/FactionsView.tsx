import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { GiCrossedSwords } from 'react-icons/gi';
import ConfirmModal from '../components/ConfirmModal';
import FactionCard from '../components/FactionCard';
import FactionModal from '../components/FactionModal';
import { FactionItem } from '../interfaces/faction';
import { createFaction, deleteFaction, getFactions, updateFaction } from './factionApi';

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

	const refresh = useCallback(async () => {
		const list = await getFactions();
		setFactions(list || []);
	}, []);

	useEffect(() => {
		refresh().catch((e) => console.error('Error cargando facciones', e));
	}, [refresh]);

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
