import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaCogs, FaEdit, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import MechanicModal from '../components/MechanicModal';
import { MechanicItem } from '../interfaces/mechanic';
import { createMechanic, deleteMechanic, getMechanics, updateMechanic } from './mechanicApi';

interface Props {
	onBack: () => void;
}

const MechanicsView: React.FC<Props> = ({ onBack }) => {
	const [mechanics, setMechanics] = useState<MechanicItem[]>([]);
	const [search, setSearch] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<MechanicItem> | undefined>(undefined);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<MechanicItem | null>(null);

	const refresh = useCallback(async () => {
		const list = await getMechanics();
		setMechanics(list || []);
	}, []);

	useEffect(() => {
		refresh().catch((e) => console.error('Error cargando mecánicas', e));
	}, [refresh]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const list = q
			? (mechanics || []).filter((m) =>
				(m.name || '').toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q),
			)
			: (mechanics || []);
		return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [mechanics, search]);

	return (
		<div className="panel panel-corners-soft block-border block-panel-border">
			<div className="panel-header">
				<button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
					<FaArrowLeft size={22} color="#FFD700" />
				</button>
				<h1 style={{ margin: 0 }}>Mecánicas</h1>
				<button
					className="icon"
					aria-label="Nueva Mecánica"
					title="Nueva Mecánica"
					onClick={() => {
						setInitial(undefined);
						setModalOpen(true);
					}}
				>
					<FaCogs size={22} color="#FFD700" />
				</button>
			</div>

			<div className="filters-bar">
				<div className="filters-row">
					<input
						type="text"
						placeholder="Buscar mecánica..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
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
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
					{filtered.map((m) => (
						<div key={m.id} className="block-border block-border-soft mechanic-card" style={{ padding: 12 }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
								<div style={{ minWidth: 0 }}>
									<div style={{ fontWeight: 800, wordBreak: 'break-word' }}>{m.name}</div>
									{m.description ? (
										<div style={{ marginTop: 6, opacity: 0.9, fontSize: 13, whiteSpace: 'pre-wrap' }}>{m.description}</div>
									) : null}
								</div>
								<div className="mechanic-actions" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
									<button
										className="icon option"
										title="Editar"
										onClick={() => {
											setInitial(m);
											setModalOpen(true);
										}}
									>
										<FaEdit size={16} />
									</button>
									<button
										className="icon option"
										title="Eliminar"
										onClick={() => {
											setPendingDelete(m);
											setConfirmOpen(true);
										}}
									>
										<FaTrash size={16} />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{filtered.length === 0 ? (
					<div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay mecánicas todavía.</div>
				) : null}
			</div>

			{modalOpen ? (
				<MechanicModal
					open={modalOpen}
					initial={initial}
					existing={mechanics}
					onClose={() => {
						setModalOpen(false);
						setInitial(undefined);
					}}
					onSubmit={async (data) => {
						if (initial?.id) await updateMechanic(initial.id, data);
						else await createMechanic(data);
						await refresh();
						setModalOpen(false);
						setInitial(undefined);
					}}
				/>
			) : null}

			<ConfirmModal
				open={confirmOpen}
				message={'¿Estás seguro de que deseas eliminar esta mecánica?'}
				onConfirm={async () => {
					const target = pendingDelete;
					setConfirmOpen(false);
					setPendingDelete(null);
					if (!target) return;
					await deleteMechanic(target.id);
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

export default MechanicsView;
