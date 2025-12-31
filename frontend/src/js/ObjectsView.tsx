import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaExclamation } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa';
import { FaEdit, FaExternalLinkAlt, FaTrash } from 'react-icons/fa';
import { GiChest } from 'react-icons/gi';
import ConfirmModal from '../components/ConfirmModal';
import GameObjectModal from '../components/GameObjectModal';
import CpImage from '../components/CpImage';
import ClearableSearchInput from '../components/ClearableSearchInput';
import { GameObjectItem } from '../interfaces/gameObject';
import { createObject, deleteObject, getObjects, updateObject, uploadObjectIcon } from './gameObjectApi';

function normalizeLink(raw: string): string {
	const v = (raw || '').trim();
	if (!v) return '';
	if (/^https?:\/\//i.test(v)) return v;
	return `https://${v}`;
}

function asImageUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

interface Props {
	onBack: () => void;
}

const ObjectsView: React.FC<Props> = ({ onBack }) => {
	const [objects, setObjects] = useState<GameObjectItem[]>([]);
	const [search, setSearch] = useState('');

	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<GameObjectItem> | undefined>(undefined);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<GameObjectItem | null>(null);

	const refresh = useCallback(async () => {
		const list = await getObjects();
		setObjects(list || []);
	}, []);

	useEffect(() => {
		refresh().catch((e) => console.error('Error cargando objetos', e));
	}, [refresh]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const list = q
			? (objects || []).filter((o) =>
				(o.name || '').toLowerCase().includes(q) ||
				(o.description || '').toLowerCase().includes(q) ||
				(o.fileLink || '').toLowerCase().includes(q),
			)
			: (objects || []);
		return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [objects, search]);

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
					<div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>Objetos</div>
				</div>
				<button
					className="icon"
					aria-label="Nuevo Objeto"
					title="Nuevo Objeto"
					onClick={() => {
						setInitial(undefined);
						setModalOpen(true);
					}}
				>
					<GiChest size={26} color="#FFD700" />
				</button>
			</div>

			<div className="filters-bar">
				<div className="filters-row">
					<ClearableSearchInput
						value={search}
						onChange={(v) => setSearch(v)}
						placeholder="Buscar objeto..."
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
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
					{filtered.map((o) => {
						const iconUrl = asImageUrl(o.icon);
						const missing: string[] = [];
						if (!(o.icon || '').trim()) missing.push('icono');
						if (!(o.description || '').trim()) missing.push('descripción');
						if (!(o.fileLink || '').trim()) missing.push('link');
						const showWarning = missing.length > 0;

						return (
							<div key={o.id} className="block-border block-border-soft mechanic-card" style={{ padding: 12, position: 'relative' }}>
								{showWarning ? (
									<span
										className="campaign-warning"
										title={`Falta: ${missing.join(', ')}.`}
										aria-label="Faltan datos"
										onClick={(e) => e.stopPropagation()}
										onPointerDown={(e) => e.stopPropagation()}
									>
										<FaExclamation size={14} />
									</span>
								) : null}

								<div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
									<div style={{ minWidth: 0 }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
												<CpImage src={iconUrl} width={32} height={32} fit="cover" frameStyle={{ flex: '0 0 auto' }} />
											<div style={{ fontWeight: 800, wordBreak: 'break-word' }}>{o.name}</div>
										</div>

										{o.description ? (
											<div style={{ marginTop: 6, opacity: 0.9, fontSize: 13, whiteSpace: 'pre-wrap' }}>{o.description}</div>
										) : null}

										{(o.fileLink || '').trim() ? (
											<div style={{ marginTop: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
												<FaExternalLinkAlt size={12} />
												<a
													href={normalizeLink(o.fileLink || '')}
													target="_blank"
													rel="noreferrer"
													style={{ color: '#e2c044', textDecoration: 'underline', wordBreak: 'break-all' }}
												>
													{(o.fileLink || '').trim()}
												</a>
											</div>
										) : null}
									</div>

									<div className="mechanic-actions" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
										<button
											className="icon option"
											title="Editar"
											onClick={() => {
												setInitial(o);
												setModalOpen(true);
											}}
										>
											<FaEdit size={16} />
										</button>
										<button
											className="icon option"
											title="Eliminar"
											onClick={() => {
												setPendingDelete(o);
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

				{filtered.length === 0 ? (
					<div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay objetos todavía.</div>
				) : null}
			</div>

			{modalOpen ? (
				<GameObjectModal
					open={modalOpen}
					initial={initial}
					existing={objects}
					onClose={() => {
						setModalOpen(false);
						setInitial(undefined);
					}}
					onSubmit={async (data) => {
						const anyData = data as any;
						const iconFile: File | null | undefined = anyData?.iconFile;
						let icon = (data.icon || '').trim();
						if ((anyData as any).removeIcon) {
							icon = '';
						} else if (iconFile) {
							const uploaded = await uploadObjectIcon(iconFile);
							if (uploaded) icon = uploaded;
						}

						const { iconFile: _ignored, ...rest } = anyData;
						const payload = { ...rest, icon } as { name: string; icon?: string; description?: string; fileLink?: string };

						if (initial?.id) await updateObject(initial.id, payload);
						else await createObject(payload);
						await refresh();
						setModalOpen(false);
						setInitial(undefined);
					}}
				/>
			) : null}

			<ConfirmModal
				open={confirmOpen}
				requireText="eliminar"
				message={'¿Estás seguro de que deseas eliminar este objeto?'}
				onConfirm={async () => {
					const target = pendingDelete;
					setConfirmOpen(false);
					setPendingDelete(null);
					if (!target) return;
					await deleteObject(target.id);
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

export default ObjectsView;
