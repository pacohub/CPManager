import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaEdit, FaExclamationTriangle, FaExternalLinkAlt, FaTrash } from 'react-icons/fa';
import { GiWarPick } from 'react-icons/gi';
import ConfirmModal from '../components/ConfirmModal';
import ProfessionModal from '../components/ProfessionModal';
import { ProfessionItem } from '../interfaces/profession';
import { createProfession, deleteProfession, getProfessions, updateProfession } from './professionApi';

function normalizeLink(raw: string): string {
	const v = (raw || '').trim();
	if (!v) return '';
	if (/^https?:\/\//i.test(v)) return v;
	return `https://${v}`;
}

interface Props {
	onBack: () => void;
	onOpenProfession?: (id: number) => void;
}

const ProfessionsView: React.FC<Props> = ({ onBack, onOpenProfession }) => {
	const [professions, setProfessions] = useState<ProfessionItem[]>([]);
	const [search, setSearch] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [initial, setInitial] = useState<Partial<ProfessionItem> | undefined>(undefined);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<ProfessionItem | null>(null);

	const refresh = useCallback(async () => {
		const list = await getProfessions();
		setProfessions(list || []);
	}, []);

	useEffect(() => {
		refresh().catch((e) => console.error('Error cargando profesiones', e));
	}, [refresh]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const list = q
			? (professions || []).filter((p) =>
				(p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q),
			)
			: (professions || []);
		return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
	}, [professions, search]);

	return (
		<div className="panel panel-corners-soft block-border block-panel-border">
			<div className="panel-header">
				<button className="icon" onClick={onBack} title="Volver" aria-label="Volver">
					<FaArrowLeft size={22} color="#FFD700" />
				</button>
				<h1 style={{ margin: 0 }}>Profesiones</h1>
				<button
					className="icon"
					aria-label="Nueva Profesión"
					title="Nueva Profesión"
					onClick={() => {
						setInitial(undefined);
						setModalOpen(true);
					}}
				>
					<GiWarPick size={24} color="#FFD700" />
				</button>
			</div>

			<div style={{ display: 'flex', alignItems: 'center', padding: '0 12px 12px 12px' }}>
				<input
					type="text"
					placeholder="Buscar profesión..."
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
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
					{filtered.map((p) => (
						<div
							key={p.id}
							className="block-border block-border-soft mechanic-card"
							style={{ padding: 12, cursor: onOpenProfession ? 'pointer' : 'default' }}
							onClick={() => onOpenProfession?.(p.id)}
						>
							{(!(p.description || '').trim() || !(p.link || '').trim()) ? (
								<span
									className="campaign-warning"
									title={`Falta: ${[
										!(p.description || '').trim() ? 'descripción' : null,
										!(p.link || '').trim() ? 'link' : null,
									].filter(Boolean).join(', ')}.`}
									aria-label="Faltan datos"
									onClick={(e) => e.stopPropagation()}
									onPointerDown={(e) => e.stopPropagation()}
								>
									<FaExclamationTriangle size={14} />
								</span>
							) : null}
							<div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
								<div style={{ minWidth: 0 }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
										<div style={{ fontWeight: 800, wordBreak: 'break-word' }}>{p.name}</div>
									</div>
									{p.description ? (
										<div style={{ marginTop: 6, opacity: 0.9, fontSize: 13, whiteSpace: 'pre-wrap' }}>{p.description}</div>
									) : null}
									{(p.link || '').trim() ? (
										<div style={{ marginTop: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
											<FaExternalLinkAlt size={12} />
											<a
												href={normalizeLink(p.link || '')}
												target="_blank"
												rel="noreferrer"
												style={{ color: '#e2c044', textDecoration: 'underline', wordBreak: 'break-all' }}
											>
												{(p.link || '').trim()}
											</a>
										</div>
									) : null}
								</div>
								<div className="mechanic-actions" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
									<button
										className="icon option"
										title="Editar"
										onClick={(e) => {
										e.stopPropagation();
											setInitial(p);
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
											setPendingDelete(p);
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
					<div style={{ marginTop: 12, opacity: 0.8, color: '#e2d9b7' }}>No hay profesiones todavía.</div>
				) : null}
			</div>

			{modalOpen ? (
				<ProfessionModal
					open={modalOpen}
					initial={initial}
					existing={professions}
					onClose={() => {
						setModalOpen(false);
						setInitial(undefined);
					}}
					onSubmit={async (data) => {
						if (initial?.id) await updateProfession(initial.id, data);
						else await createProfession(data);
						await refresh();
						setModalOpen(false);
						setInitial(undefined);
					}}
				/>
			) : null}

			<ConfirmModal
				open={confirmOpen}
				message={'¿Estás seguro de que deseas eliminar esta profesión?'}
				onConfirm={async () => {
					const target = pendingDelete;
					setConfirmOpen(false);
					setPendingDelete(null);
					if (!target) return;
					await deleteProfession(target.id);
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

export default ProfessionsView;
