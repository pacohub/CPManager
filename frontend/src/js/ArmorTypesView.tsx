import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { FaShieldAlt, FaEdit, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import ArmorTypeModal from '../components/ArmorTypeModal';
import ClearableSearchInput from '../components/ClearableSearchInput';
import { ArmorTypeItem } from '../interfaces/armorType';
import { SoundItem } from '../interfaces/sound';
import { createArmorType, deleteArmorType, getArmorTypes, updateArmorType } from './armorTypeApi';
import { getSounds } from './soundApi';

interface Props {
	onBack: () => void;
}

const ArmorTypesView: React.FC<Props> = ({ onBack }) => {
	const [items, setItems] = useState<ArmorTypeItem[]>([]);
	const [sounds, setSounds] = useState<SoundItem[]>([]);
	const [search, setSearch] = useState('');
	const [error, setError] = useState<string | null>(null);

	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<ArmorTypeItem> | undefined>(undefined);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<ArmorTypeItem | null>(null);

	const refresh = useCallback(async () => {
		setError(null);
		const [list, snd] = await Promise.all([
			getArmorTypes().catch((e: any) => {
				setError((prev) => prev || (e?.message || 'No se pudieron cargar los tipos de armadura.'));
				return [] as ArmorTypeItem[];
			}),
			getSounds().catch((e: any) => {
				setError((prev) => prev || (e?.message || 'No se pudieron cargar los sonidos.'));
				return [] as SoundItem[];
			}),
		]);
		setItems(list || []);
		setSounds(snd || []);
	}, []);

	useEffect(() => {
		refresh().catch((e) => console.error('Error cargando tipos de armadura', e));
	}, [refresh]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const list = q ? (items || []).filter((a) => (a.name || '').toLowerCase().includes(q)) : (items || []);
		return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [items, search]);

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
					<div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>Tipos de armadura</div>
				</div>
				<button
					className="icon"
					aria-label="Nuevo Tipo de armadura"
					title="Nuevo Tipo de armadura"
					onClick={() => {
						setInitial(undefined);
						setModalOpen(true);
					}}
				>
					<FaShieldAlt size={22} color="#FFD700" />
				</button>
			</div>

			<div className="filters-bar">
				<div className="filters-row">
					<ClearableSearchInput
						value={search}
						onChange={(v) => setSearch(v)}
						placeholder="Buscar tipo de armadura..."
						className="filters-input"
					/>
				</div>
			</div>

			{error ? (
				<div style={{ padding: '0 12px 12px 12px', color: '#e2d9b7', opacity: 0.95, fontSize: 13 }}>{error}</div>
			) : null}

			{search.trim() ? (
				<div style={{ marginTop: -8, marginBottom: 16, opacity: 0.9, fontSize: 13, padding: '0 12px' }}>Resultados: {filtered.length}</div>
			) : null}

			<div style={{ padding: 12 }}>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
					{filtered.map((a) => {
						const soundCount = (a.sounds || []).length;
						return (
							<div key={a.id} className="block-border block-border-soft mechanic-card" style={{ padding: 12 }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
									<div style={{ minWidth: 0 }}>
										<div style={{ fontWeight: 800, wordBreak: 'break-word' }}>{a.name}</div>
										<div style={{ marginTop: 4, opacity: 0.85, fontSize: 12 }}>Sonidos: {soundCount}</div>
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
						);
					})}
				</div>

				{filtered.length === 0 ? <div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay tipos de armadura todavía.</div> : null}
			</div>

			{modalOpen ? (
				<ArmorTypeModal
					open={modalOpen}
					initial={initial}
					existing={items}
					sounds={sounds}
					onClose={() => {
						setModalOpen(false);
						setInitial(undefined);
					}}
					onSubmit={async (data) => {
						if (initial?.id) await updateArmorType(Number(initial.id), { name: data.name, soundIds: data.soundIds });
						else await createArmorType({ name: data.name, soundIds: data.soundIds });
						await refresh();
						setModalOpen(false);
						setInitial(undefined);
					}}
				/>
			) : null}

			<ConfirmModal
				open={confirmOpen}
				requireText="eliminar"
				message={'¿Estás seguro de que deseas eliminar este tipo de armadura?'}
				onConfirm={async () => {
					const target = pendingDelete;
					setConfirmOpen(false);
					setPendingDelete(null);
					if (!target) return;
					await deleteArmorType(target.id);
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

export default ArmorTypesView;
