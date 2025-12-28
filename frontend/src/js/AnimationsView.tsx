import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { FaRunning } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import AnimationModal from '../components/AnimationModal';
import { AnimationItem } from '../interfaces/animation';
import { createAnimation, deleteAnimation, getAnimations, updateAnimation } from './animationApi';

interface Props {
	onBack: () => void;
}

const AnimationsView: React.FC<Props> = ({ onBack }) => {
	const [items, setItems] = useState<AnimationItem[]>([]);
	const [search, setSearch] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<AnimationItem> | undefined>(undefined);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<AnimationItem | null>(null);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		setError(null);
		try {
			const list = await getAnimations();
			setItems(list || []);
		} catch (e: any) {
			setError(e?.message || 'No se pudieron cargar las animaciones.');
			setItems([]);
		}
	}, []);

	useEffect(() => {
		refresh().catch((e) => console.error('Error cargando animaciones', e));
	}, [refresh]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const list = q ? (items || []).filter((a) => (a.name || '').toLowerCase().includes(q)) : (items || []);
		return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [items, search]);

	return (
		<div className="panel panel-corners-soft block-border block-panel-border">
			<div className="panel-header">
				<button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
					<FaArrowLeft size={22} color="#FFD700" />
				</button>
				<h1 style={{ margin: 0 }}>Animaciones</h1>
				<button
					className="icon"
					aria-label="Nueva Animación"
					title="Nueva Animación"
					onClick={() => {
						setInitial(undefined);
						setModalOpen(true);
					}}
				>
					<FaRunning size={24} color="#FFD700" />
				</button>
			</div>

			<div className="filters-bar">
				<div className="filters-row">
					<input
						type="text"
						placeholder="Buscar animación..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="filters-input"
					/>
				</div>
			</div>

			{error ? (
				<div style={{ padding: '0 12px 12px 12px', color: '#e2d9b7', opacity: 0.95, fontSize: 13 }}>{error}</div>
			) : null}

			<div style={{ padding: 12 }}>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
					{filtered.map((a) => (
						<div key={a.id} className="block-border block-border-soft mechanic-card" style={{ padding: 12, position: 'relative' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
								<div style={{ minWidth: 0 }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
										<div style={{ fontWeight: 800, wordBreak: 'break-word' }}>{a.name}</div>
									</div>
								</div>

								<div className="mechanic-actions" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
									<button
										className="icon option"
										title="Editar"
										onClick={() => {
											setInitial(a);
											setModalOpen(true);
										}}
									>
										<FaEdit size={16} />
									</button>
									<button
										className="icon option"
										title="Eliminar"
										onClick={() => {
											setPendingDelete(a);
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

				{filtered.length === 0 ? <div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay animaciones todavía.</div> : null}
			</div>

			{modalOpen ? (
				<AnimationModal
					open={modalOpen}
					initial={initial}
					existing={items}
					onClose={() => {
						setModalOpen(false);
						setInitial(undefined);
					}}
					onSubmit={async (data) => {
						if (initial?.id) await updateAnimation(initial.id, data);
						else await createAnimation(data);
						await refresh();
						setModalOpen(false);
						setInitial(undefined);
					}}
				/>
			) : null}

			<ConfirmModal
				open={confirmOpen}
				message={'¿Estás seguro de que deseas eliminar esta animación?'}
				onConfirm={async () => {
					const target = pendingDelete;
					setConfirmOpen(false);
					setPendingDelete(null);
					if (!target) return;
					await deleteAnimation(target.id);
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

export default AnimationsView;
