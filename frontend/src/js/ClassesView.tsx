import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaEdit, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { GiCrossedSwords } from 'react-icons/gi';
import ConfirmModal from '../components/ConfirmModal';
import ClassModal from '../components/ClassModal';
import { AnimationItem } from '../interfaces/animation';
import { ClassItem } from '../interfaces/class';
import { getAnimations } from './animationApi';
import { createClass, deleteClass, getClasses, updateClass, uploadClassIcon } from './classApi';

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

const ClassesView: React.FC<Props> = ({ onBack }) => {
	const [classes, setClasses] = useState<ClassItem[]>([]);
	const [animations, setAnimations] = useState<AnimationItem[]>([]);
	const [search, setSearch] = useState('');
	const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
	const [selectedAnimationIds, setSelectedAnimationIds] = useState<number[]>([]);
	const [savingAnimations, setSavingAnimations] = useState(false);

	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<ClassItem> | undefined>(undefined);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<ClassItem | null>(null);

	const refresh = useCallback(async () => {
		const [list, anims] = await Promise.all([getClasses(), getAnimations().catch(() => [] as AnimationItem[])]);
		setClasses(list || []);
		setAnimations(anims || []);
	}, []);

	useEffect(() => {
		refresh().catch((e) => console.error('Error cargando clases', e));
	}, [refresh]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const list = q
			? (classes || []).filter((c) => (c.name || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q))
			: (classes || []);
		return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [classes, search]);

	const orderedAnimations = useMemo(() => {
		return (animations || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [animations]);

	useEffect(() => {
		if (!selectedClass) return;
		const ids = (selectedClass.animations || []).map((x) => x.id).filter((x) => Number.isFinite(x as any)) as number[];
		setSelectedAnimationIds(Array.from(new Set(ids)));
	}, [selectedClass]);

	if (selectedClass) {
		const c = selectedClass;
		const iconUrl = asImageUrl(c.icon);
		const selectedSet = new Set(selectedAnimationIds);
		return (
			<div className="panel panel-corners-soft block-border block-panel-border">
				<div className="panel-header">
					<button className="icon" onClick={() => setSelectedClass(null)} title="Volver" aria-label="Volver">
						<FaArrowLeft size={22} color="#FFD700" />
					</button>
					<h1 style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</h1>
					<div style={{ width: 40 }} />
				</div>

				<div style={{ padding: 12 }}>
					<div className="block-border block-border-soft" style={{ padding: 12 }}>
						<div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
							{iconUrl ? (
								<div className="metallic-border metallic-border-square" style={{ width: 96, height: 96, minWidth: 96, backgroundImage: 'none' }}>
									<img src={iconUrl} alt="" aria-hidden="true" style={{ width: 96, height: 96, objectFit: 'cover', display: 'block' }} />
								</div>
							) : null}
							<div style={{ flex: '1 1 320px', minWidth: 260 }}>
								<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
									<div>
										<div className="chapter-label">Nivel</div>
										<div>{Number.isFinite(c.level as any) ? Number(c.level) : 1}</div>
									</div>
									<div>
										<div className="chapter-label">Descripción</div>
										<div style={{ whiteSpace: 'pre-wrap', opacity: 0.95 }}>{(c.description || '').trim() ? c.description : '-'}</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="block-border block-border-soft" style={{ padding: 12, marginTop: 12 }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
							<div style={{ fontWeight: 900 }}>Animaciones</div>
							<button
								className="icon option"
								title="Guardar animaciones"
								disabled={savingAnimations}
								onClick={async () => {
									setSavingAnimations(true);
									try {
										const updated = await updateClass(c.id, { animationIds: selectedAnimationIds });
										setSelectedClass(updated);
										setClasses((prev) => (prev || []).map((it) => (it.id === updated.id ? updated : it)));
									} finally {
										setSavingAnimations(false);
									}
								}}
							>
								{savingAnimations ? '...' : 'Guardar'}
							</button>
						</div>

						{orderedAnimations.length === 0 ? (
							<div style={{ marginTop: 8, opacity: 0.85, fontSize: 13 }}>No hay animaciones creadas todavía.</div>
						) : (
							<div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
								{orderedAnimations.map((a) => (
									<label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: 0.95 }}>
										<input
											type="checkbox"
											checked={selectedSet.has(a.id)}
											onChange={(e) => {
												const checked = e.target.checked;
												setSelectedAnimationIds((prev) => {
													const cur = new Set(prev);
													if (checked) cur.add(a.id);
													else cur.delete(a.id);
													return Array.from(cur.values());
												});
											}}
										/>
										<span style={{ wordBreak: 'break-word' }}>{a.name}</span>
									</label>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="panel panel-corners-soft block-border block-panel-border">
			<div className="panel-header">
				<button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
					<FaArrowLeft size={22} color="#FFD700" />
				</button>
				<h1 style={{ margin: 0 }}>Clases</h1>
				<button
					className="icon"
					aria-label="Nueva Clase"
					title="Nueva Clase"
					onClick={() => {
						setInitial(undefined);
						setModalOpen(true);
					}}
				>
					<GiCrossedSwords size={26} color="#FFD700" />
				</button>
			</div>

			<div className="filters-bar">
				<div className="filters-row">
					<input
						type="text"
						placeholder="Buscar clase..."
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
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
					{filtered.map((c) => {
						const iconUrl = asImageUrl(c.icon);
						const missing: string[] = [];
						if (!(c.icon || '').trim()) missing.push('icono');
						if (!(c.description || '').trim()) missing.push('descripción');
						if (!Number.isFinite(c.level as any) || Number(c.level) <= 0) missing.push('nivel');
						const showWarning = missing.length > 0;

						return (
							<div
								key={c.id}
								className="block-border block-border-soft mechanic-card"
								style={{ padding: 12, position: 'relative', cursor: 'pointer' }}
								role="button"
								tabIndex={0}
								onClick={() => setSelectedClass(c)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') setSelectedClass(c);
								}}
							>
								{showWarning ? (
									<span
										className="campaign-warning"
										title={`Falta: ${missing.join(', ')}.`}
										aria-label="Faltan datos"
										onClick={(e) => e.stopPropagation()}
										onPointerDown={(e) => e.stopPropagation()}
									>
										<FaExclamationTriangle size={14} />
									</span>
								) : null}

								<div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
									<div style={{ minWidth: 0 }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
											{iconUrl ? (
												<div
													className="metallic-border metallic-border-square"
													style={{ width: 32, height: 32, minWidth: 32, backgroundImage: 'none', flex: '0 0 auto' }}
												>
													<img
														src={iconUrl}
														alt=""
														aria-hidden="true"
														style={{ width: 32, height: 32, objectFit: 'cover', display: 'block' }}
													/>
												</div>
											) : null}
											<div style={{ minWidth: 0 }}>
												<div style={{ fontWeight: 800, wordBreak: 'break-word' }}>{c.name}</div>
												<div style={{ marginTop: 2, opacity: 0.9, fontSize: 13 }}>Nivel: {Number.isFinite(c.level as any) ? Number(c.level) : 1}</div>
											</div>
										</div>

										{c.description ? (
											<div style={{ marginTop: 6, opacity: 0.9, fontSize: 13, whiteSpace: 'pre-wrap' }}>{c.description}</div>
										) : null}
									</div>

									<div className="mechanic-actions" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
										<button
											className="icon option"
											title="Editar"
											onClick={(e) => {
											e.stopPropagation();
												setInitial(c);
												setModalOpen(true);
											}}
										>
											<FaEdit size={16} />
										</button>
										<button
											className="icon option"
											title="Eliminar"
											onClick={(e) => {
											e.stopPropagation();
												setPendingDelete(c);
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
					<div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay clases todavía.</div>
				) : null}
			</div>

			{modalOpen ? (
				<ClassModal
					open={modalOpen}
					initial={initial}
					existing={classes}
					onClose={() => {
						setModalOpen(false);
						setInitial(undefined);
					}}
					onSubmit={async (data) => {
						const anyData = data as any;
						const iconFile: File | null | undefined = anyData?.iconFile;
						let icon = (data.icon || '').trim();
						if (iconFile) {
							const uploaded = await uploadClassIcon(iconFile);
							if (uploaded) icon = uploaded;
						}

						const { iconFile: _ignored, ...rest } = anyData;
						const payload = { ...rest, icon } as { name: string; icon?: string; description?: string; level?: number };

						if (initial?.id) await updateClass(initial.id, payload);
						else await createClass(payload);
						await refresh();
						setModalOpen(false);
						setInitial(undefined);
					}}
				/>
			) : null}

			<ConfirmModal
				open={confirmOpen}
				message={'¿Estás seguro de que deseas eliminar esta clase?'}
				onConfirm={async () => {
					const target = pendingDelete;
					setConfirmOpen(false);
					setPendingDelete(null);
					if (!target) return;
					await deleteClass(target.id);
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

export default ClassesView;
