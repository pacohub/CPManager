import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaEdit, FaExclamationTriangle, FaTrash, FaVolumeUp } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import SoundModal from '../components/SoundModal';
import { SoundItem } from '../interfaces/sound';
import { SoundTypeItem } from '../interfaces/soundType';
import { createSound, deleteSound, getSounds, updateSound } from './soundApi';
import { createSoundType, getSoundTypes } from './soundTypeApi';

function asFileUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

interface Props {
	onBack: () => void;
}

const SoundsView: React.FC<Props> = ({ onBack }) => {
	const [sounds, setSounds] = useState<SoundItem[]>([]);
	const [types, setTypes] = useState<SoundTypeItem[]>([]);
	const [search, setSearch] = useState('');
	const [typeFilterIds, setTypeFilterIds] = useState<number[]>([]);
	const [error, setError] = useState<string | null>(null);

	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<SoundItem> | undefined>(undefined);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<SoundItem | null>(null);

	const refresh = useCallback(async () => {
		setError(null);
		const [t, s] = await Promise.all([
			getSoundTypes().catch((e: any) => {
				setError((prev) => prev || (e?.message || 'No se pudieron cargar los tipos de sonido.'));
				return [] as SoundTypeItem[];
			}),
			getSounds().catch((e: any) => {
				setError((prev) => prev || (e?.message || 'No se pudieron cargar los sonidos.'));
				return [] as SoundItem[];
			}),
		]);
		setTypes(t || []);
		setSounds(s || []);
	}, []);

	useEffect(() => {
		refresh().catch((e) => console.error(e));
	}, [refresh]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		let list = q
			? (sounds || []).filter((s) => {
				const typeNames = (s.types || []).map((t) => t.name).join(' ').toLowerCase();
				return (s.name || '').toLowerCase().includes(q) || typeNames.includes(q);
			})
			: (sounds || []);
		if (typeFilterIds.length > 0) {
			list = list.filter((s) => (s.types || []).some((t) => typeFilterIds.includes(t.id)));
		}
		return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [sounds, search, typeFilterIds]);

	return (
		<div className="panel panel-corners-soft block-border block-panel-border">
			<div className="panel-header">
				<button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
					<FaArrowLeft size={22} color="#FFD700" />
				</button>
				<h1 style={{ margin: 0 }}>Sonidos</h1>
				<button
					className="icon"
					aria-label="Nuevo Sonido"
					title="Nuevo Sonido"
					onClick={() => {
						setInitial(undefined);
						setModalOpen(true);
					}}
				>
					<FaVolumeUp size={22} color="#FFD700" />
				</button>
			</div>

			<div className="filters-bar">
				<div className="filters-row">
					<input
						type="text"
						placeholder="Buscar sonido..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="filters-input"
					/>
				</div>

				{(types || []).length > 0 ? (
					<div className="filters-chips">
						<button
							type="button"
							className="icon option filter-pill"
							title={typeFilterIds.length ? 'Quitar filtros' : 'Mostrando todos'}
							aria-label="Todos"
							data-selected={typeFilterIds.length === 0}
							onClick={() => setTypeFilterIds([])}
						>
							Todos
						</button>
						{types.map((t) => {
							const selected = typeFilterIds.includes(t.id);
							const label = (t.name || '').trim();
							const display = label ? label.charAt(0).toUpperCase() + label.slice(1) : '';
							return (
								<button
									key={t.id}
									type="button"
									className="icon option filter-pill"
									title={display || 'Tipo'}
									aria-label={display || 'Tipo'}
									data-selected={selected}
									onClick={() => {
										setTypeFilterIds((prev) => (selected ? prev.filter((x) => x !== t.id) : [...prev, t.id]));
									}}
								>
									{display || '(sin nombre)'}
								</button>
							);
						})}
					</div>
				) : null}
			</div>

			{error ? (
				<div style={{ padding: '0 12px 12px 12px', color: '#e2d9b7', opacity: 0.95, fontSize: 13 }}>{error}</div>
			) : null}

			<div style={{ padding: 12 }}>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
					{filtered.map((s) => {
						const fileUrl = asFileUrl(s.file);
						const missing: string[] = [];
						if (!fileUrl) missing.push('archivo');
						if ((s.types || []).length === 0) missing.push('tipo');
						const showWarning = missing.length > 0;
						const warningText = `Falta: ${missing.join(', ')}.`;
						return (
							<div key={s.id} className="block-border block-border-soft mechanic-card" style={{ padding: 12, position: 'relative' }}>
								{showWarning ? (
									<span className="campaign-warning" title={warningText} aria-label={warningText}>
										<FaExclamationTriangle size={14} />
									</span>
								) : null}
								<div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
									<div style={{ minWidth: 0 }}>
										<div style={{ fontWeight: 900, wordBreak: 'break-word' }}>{s.name}</div>
										<div style={{ marginTop: 4, opacity: 0.9, fontSize: 13 }}>
											Tipos: {(s.types || []).map((t) => t.name).join(', ') || '(ninguno)'}
										</div>
										{fileUrl ? (
											<div style={{ marginTop: 8, fontSize: 13, wordBreak: 'break-all' }}>
												<a href={fileUrl} target="_blank" rel="noreferrer" style={{ color: '#e2c044', textDecoration: 'underline' }}>
													{(s.file || '').trim()}
												</a>
											</div>
										) : null}
									</div>

									<div className="mechanic-actions" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
										<button
											className="icon option"
											title="Editar"
											onClick={() => {
												setInitial(s);
												setModalOpen(true);
											}}
										>
											<FaEdit size={16} />
										</button>
										<button
											className="icon option"
											title="Eliminar"
											onClick={() => {
												setPendingDelete(s);
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

				{filtered.length === 0 ? <div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay sonidos todavía.</div> : null}
			</div>

			{modalOpen ? (
				<SoundModal
					open={modalOpen}
					initial={initial}
					existing={sounds}
					types={types}
					onClose={() => {
						setModalOpen(false);
						setInitial(undefined);
					}}
					onCreateType={async (name) => {
						await createSoundType({ name });
						await refresh();
					}}
					onSubmit={async (data) => {
						const formData = new FormData();
						formData.append('name', data.name);
						formData.append('typeIds', JSON.stringify(data.typeIds || []));
						if (data.file) formData.append('file', data.file);
						if (initial?.id) await updateSound(initial.id as number, formData);
						else await createSound(formData);
						await refresh();
						setModalOpen(false);
						setInitial(undefined);
					}}
				/>
			) : null}

			<ConfirmModal
				open={confirmOpen}
				message={'¿Estás seguro de que deseas eliminar este sonido?'}
				onConfirm={async () => {
					const target = pendingDelete;
					setConfirmOpen(false);
					setPendingDelete(null);
					if (!target) return;
					await deleteSound(target.id);
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

export default SoundsView;
