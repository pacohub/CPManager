import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaCubes, FaEdit, FaExclamationTriangle, FaExternalLinkAlt, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import ComponentModal from '../components/ComponentModal';
import { ComponentItem } from '../interfaces/component';
import { createComponent, deleteComponent, getComponents, updateComponent } from './componentApi';

function asImageUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

function normalizeLink(raw: string): string {
	const v = (raw || '').trim();
	if (!v) return '';
	if (/^https?:\/\//i.test(v)) return v;
	return `https://${v}`;
}

interface Props {
	onBack: () => void;
}

const ComponentsView: React.FC<Props> = ({ onBack }) => {
	const [items, setItems] = useState<ComponentItem[]>([]);
	const [search, setSearch] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<ComponentItem> | undefined>(undefined);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<ComponentItem | null>(null);

	const refresh = useCallback(async () => {
		const list = await getComponents();
		setItems(list || []);
	}, []);

	useEffect(() => {
		refresh().catch((e) => console.error('Error cargando componentes', e));
	}, [refresh]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const list = q
			? (items || []).filter((c) =>
				(c.name || '').toLowerCase().includes(q) ||
				(c.type || '').toLowerCase().includes(q) ||
				(c.description || '').toLowerCase().includes(q),
			)
			: (items || []);
		return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [items, search]);

	return (
		<div className="panel panel-corners-soft block-border block-panel-border">
			<div className="panel-header">
				<button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
					<FaArrowLeft size={22} color="#FFD700" />
				</button>
				<h1 style={{ margin: 0 }}>Componentes</h1>
				<button
					className="icon"
					aria-label="Nuevo Componente"
					title="Nuevo Componente"
					onClick={() => {
						setInitial(undefined);
						setModalOpen(true);
					}}
				>
					<FaCubes size={22} color="#FFD700" />
				</button>
			</div>

			<div className="filters-bar">
				<div className="filters-row">
					<input
						type="text"
						placeholder="Buscar componente..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="filters-input"
					/>
				</div>
			</div>

			<div style={{ padding: 12 }}>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
					{filtered.map((c) => (
						<div key={c.id} className="block-border block-border-soft mechanic-card" style={{ padding: 12, position: 'relative' }}>
							{(() => {
								const missing: string[] = [];
								if (!String(c.description ?? '').trim()) missing.push('descripción');
								if (!String(c.image ?? '').trim()) missing.push('imagen');
								if (!String(c.model ?? '').trim()) missing.push('modelo');
								if (missing.length === 0) return null;
								const warningText = `Falta: ${missing.join(', ')}.`;
								return (
									<span className="campaign-warning" title={warningText} aria-label={warningText}>
										<FaExclamationTriangle size={14} />
									</span>
								);
							})()}
							<div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
								<div style={{ minWidth: 0 }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
										{asImageUrl(c.image) ? (
											<div
												className="metallic-border metallic-border-square"
												style={{ width: 32, height: 32, minWidth: 32, backgroundImage: 'none', flex: '0 0 auto' }}
											>
												<img
													src={asImageUrl(c.image)}
													alt=""
													aria-hidden="true"
													style={{ width: 32, height: 32, objectFit: 'cover', display: 'block' }}
												/>
											</div>
										) : null}
										<div style={{ fontWeight: 800, wordBreak: 'break-word' }}>{c.name}</div>
									</div>
									<div style={{ opacity: 0.85, fontSize: 12, marginTop: 2 }}>{c.type}</div>
									{c.description ? (
										<div style={{ marginTop: 8, opacity: 0.9, fontSize: 13, whiteSpace: 'pre-wrap' }}>{c.description}</div>
									) : null}
									{(c.model || '').trim() ? (
										<div style={{ marginTop: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
											<FaExternalLinkAlt size={12} />
											<a
												href={normalizeLink(c.model || '')}
												target="_blank"
												rel="noreferrer"
												style={{ color: '#e2c044', textDecoration: 'underline', wordBreak: 'break-all' }}
											>
												{(c.model || '').trim()}
											</a>
										</div>
									) : null}
								</div>

								<div className="mechanic-actions" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
									<button
										className="icon option"
										title="Editar"
										onClick={() => {
											setInitial(c);
											setModalOpen(true);
										}}
									>
										<FaEdit size={16} />
									</button>
									<button
										className="icon option"
										title="Eliminar"
										onClick={() => {
											setPendingDelete(c);
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
					<div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay componentes todavía.</div>
				) : null}
			</div>

			{modalOpen ? (
				<ComponentModal
					open={modalOpen}
					initial={initial}
					existing={items}
					onClose={() => {
						setModalOpen(false);
						setInitial(undefined);
					}}
					onSubmit={async (formData) => {
						if (initial?.id) await updateComponent(initial.id, formData);
						else await createComponent(formData);
						await refresh();
						setModalOpen(false);
						setInitial(undefined);
					}}
				/>
			) : null}

			<ConfirmModal
				open={confirmOpen}
				message={'¿Estás seguro de que deseas eliminar este componente?'}
				onConfirm={async () => {
					const target = pendingDelete;
					setConfirmOpen(false);
					setPendingDelete(null);
					if (!target) return;
					await deleteComponent(target.id);
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

export default ComponentsView;
