import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaEdit, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { FaMountain } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import ResourceModal from '../components/ResourceModal';
import { ResourceItem } from '../interfaces/resource';
import { ResourceTypeItem } from '../interfaces/resourceType';
import { createResource, deleteResource, getResources, updateResource } from './resourceApi';
import { createResourceType, getResourceTypes } from './resourceTypeApi';

function asImageUrl(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return undefined;
}

function asExternalHref(raw?: string): string | undefined {
	const v = (raw || '').trim();
	if (!v) return undefined;
	if (v.startsWith('http://') || v.startsWith('https://')) return v;
	if (v.startsWith('/')) return encodeURI(`http://localhost:4000/${v.replace(/^\/+/, '')}`);
	return `https://${v}`;
}

interface Props {
	onBack: () => void;
}

const ResourcesView: React.FC<Props> = ({ onBack }) => {
	const [resources, setResources] = useState<ResourceItem[]>([]);
	const [resourceTypes, setResourceTypes] = useState<ResourceTypeItem[]>([]);
	const [search, setSearch] = useState('');

	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<ResourceItem> | undefined>(undefined);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<ResourceItem | null>(null);

	const refresh = useCallback(async () => {
		const [items, types] = await Promise.all([getResources(), getResourceTypes()]);
		setResources(items ?? []);
		setResourceTypes(types ?? []);
	}, []);

	useEffect(() => {
		refresh().catch((e) => console.error('Error cargando recursos', e));
	}, [refresh]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const list = q
			? (resources || []).filter((r) =>
				(r.name || '').toLowerCase().includes(q) ||
				(r.description || '').toLowerCase().includes(q) ||
				(r.resourceType?.name || '').toLowerCase().includes(q),
			)
			: (resources || []);
		return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [resources, search]);

	return (
		<div className="panel panel-corners-soft block-border block-panel-border">
			<div className="panel-header">
				<button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
					<FaArrowLeft size={22} color="#FFD700" />
				</button>
				<h1 style={{ margin: 0 }}>Recursos</h1>
				<button
					className="icon"
					aria-label="Nuevo Recurso"
					title="Nuevo Recurso"
					onClick={() => {
						setInitial(undefined);
						setModalOpen(true);
					}}
				>
					<FaMountain size={26} color="#FFD700" />
				</button>
			</div>

			<div style={{ display: 'flex', alignItems: 'center', padding: '0 12px 12px 12px' }}>
				<input
					type="text"
					placeholder="Buscar recurso..."
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
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
					{filtered.map((r) => {
						const iconUrl = asImageUrl(r.icon);
						const linkHref = asExternalHref(r.fileLink);
						const missingType = !r.resourceType?.id;
						const missingDescription = !(r.description || '').trim();
						const missingIcon = !(r.icon || '').trim();
						const missingFile = !(r.fileLink || '').trim();
						const missing: string[] = [];
						if (missingType) missing.push('tipo');
						if (missingDescription) missing.push('descripción');
						if (missingIcon) missing.push('icono');
						if (missingFile) missing.push('archivo');
						return (
							<div key={r.id} className="block-border block-border-soft mechanic-card" style={{ padding: 12 }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
									<div style={{ minWidth: 0 }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
											{iconUrl ? (
												<div
													className="metallic-border metallic-border-square"
													style={{ width: 32, height: 32, minWidth: 32, backgroundImage: 'none', flex: '0 0 auto' }}
												>
													<img src={iconUrl} alt="" aria-hidden="true" style={{ width: 32, height: 32, objectFit: 'cover', display: 'block' }} />
												</div>
											) : null}
											<div style={{ minWidth: 0 }}>
													<div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
														<div style={{ fontWeight: 800, wordBreak: 'break-word' }}>{r.name}</div>
														{missing.length > 0 ? (
															<span
																className="saga-warning"
																title={`Faltan: ${missing.join(', ')}`}
																style={{ display: 'inline-flex', alignItems: 'center' }}
															>
																<FaExclamationTriangle size={14} />
															</span>
														) : null}
													</div>
												{r.resourceType?.name ? <div style={{ marginTop: 2, fontSize: 12, opacity: 0.85 }}>{r.resourceType.name}</div> : null}
											</div>
										</div>

										{r.description ? (
											<div style={{ marginTop: 6, opacity: 0.9, fontSize: 13, whiteSpace: 'pre-wrap' }}>{r.description}</div>
										) : null}
										{linkHref ? (
											<div style={{ marginTop: 6, opacity: 0.92, fontSize: 13 }}>
												Archivo:{' '}
												<a href={linkHref} target="_blank" rel="noopener noreferrer">
													{r.fileLink}
												</a>
											</div>
										) : null}
										{missing.length > 0 ? (
											<div style={{ marginTop: 6, opacity: 0.88, fontSize: 12 }}>
												Faltan campos: {missing.join(', ')}.
											</div>
										) : null}
									</div>

									<div className="mechanic-actions" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
										<button
											className="icon option"
											title="Editar"
											onClick={() => {
												setInitial(r);
												setModalOpen(true);
											}}
										>
											<FaEdit size={16} />
										</button>
										<button
											className="icon option"
											title="Eliminar"
											onClick={() => {
												setPendingDelete(r);
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
					<div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay recursos todavía.</div>
				) : null}
			</div>

			{modalOpen ? (
				<ResourceModal
					open={modalOpen}
					initial={initial}
					existing={resources}
					resourceTypes={resourceTypes}
					onClose={() => {
						setModalOpen(false);
						setInitial(undefined);
					}}
					onCreateType={async (name) => {
						const created = await createResourceType({ name });
						const types = await getResourceTypes();
						setResourceTypes(types ?? []);
						return created;
					}}
					onSubmit={async (data) => {
						const fd = new FormData();
						fd.set('name', data.name);
						fd.set('description', data.description ?? '');
						fd.set('resourceTypeId', String(data.resourceTypeId));
						if (data.iconFile) fd.set('icon', data.iconFile);
										fd.set('fileLink', data.fileLink ?? '');

						if (initial?.id) await updateResource(Number(initial.id), fd);
						else await createResource(fd);

						await refresh();
						setModalOpen(false);
						setInitial(undefined);
					}}
				/>
			) : null}

			<ConfirmModal
				open={confirmOpen}
				message={'¿Estás seguro de que deseas eliminar este recurso?'}
				onConfirm={async () => {
					const target = pendingDelete;
					setConfirmOpen(false);
					setPendingDelete(null);
					if (!target) return;
					await deleteResource(target.id);
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

export default ResourcesView;
