
import React, { useLayoutEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import SagaPanel from './SagaPanel';
import CampaignDetail from './CampaignDetail';
import MapDetail from './MapDetail';
import MapsView from './MapsView';
import MechanicsView from './MechanicsView';
import FactionsView from './FactionsView';
import FactionDetail from './FactionDetail';
import ProfessionsView from './ProfessionsView';
import ProfessionDetail from './ProfessionDetail';
import ObjectsView from './ObjectsView';
import ComponentsView from './ComponentsView';
import ResourcesView from './ResourcesView';
import ChapterEventsView from './ChapterEventsView';
import ClassesView from './ClassesView';
import CharactersView from './CharactersView';
import CharacterDetail from './CharacterDetail';
import SoundsView from './SoundsView';
import RacesView from './RacesView';

function SagaPanelRoute() {
	const navigate = useNavigate();
	return (
		<SagaPanel
			onOpenCampaign={(id) => navigate(`/campaigns/${id}`)}
			onOpenMaps={() => navigate('/maps')}
			onOpenMechanics={() => navigate('/mechanics')}
			onOpenFactions={() => navigate('/factions')}
			onOpenClasses={() => navigate('/classes')}
			onOpenCharacters={() => navigate('/characters')}
			onOpenRaces={() => navigate('/races')}
			onOpenSounds={() => navigate('/sounds')}
			onOpenProfessions={() => navigate('/professions')}
			onOpenObjects={() => navigate('/objects')}
			onOpenComponents={() => navigate('/components')}
			onOpenResources={() => navigate('/resources')}
		/>
	);
}

function MapsRoute() {
	const navigate = useNavigate();
	return <MapsView onBack={() => navigate('/')} onOpenMap={(id) => navigate(`/maps/${id}`)} />;
}

function MapDetailRoute() {
	const navigate = useNavigate();
	const params = useParams();
	const mapId = Number(params.id);

	if (!Number.isFinite(mapId) || mapId <= 0) return <Navigate to="/maps" />;
	return <MapDetail mapId={mapId} onBack={() => navigate('/maps')} />;
}

function MechanicsRoute() {
	const navigate = useNavigate();
	return <MechanicsView onBack={() => navigate('/')} />;
}

function FactionsRoute() {
	const navigate = useNavigate();
	return <FactionsView onBack={() => navigate('/')} onOpenFaction={(id) => navigate(`/factions/${id}`)} />;
}

function FactionDetailRoute() {
	const navigate = useNavigate();
	const params = useParams();
	const factionId = Number(params.id);

	if (!Number.isFinite(factionId) || factionId <= 0) return <Navigate to="/factions" />;
	return <FactionDetail factionId={factionId} onBack={() => navigate('/factions')} />;
}

function ProfessionsRoute() {
	const navigate = useNavigate();
	return <ProfessionsView onBack={() => navigate('/')} onOpenProfession={(id) => navigate(`/professions/${id}`)} />;
}

function ProfessionDetailRoute() {
	const navigate = useNavigate();
	const params = useParams();
	const professionId = Number(params.id);

	if (!Number.isFinite(professionId) || professionId <= 0) return <Navigate to="/professions" />;
	return <ProfessionDetail professionId={professionId} onBack={() => navigate('/professions')} />;
}

function ObjectsRoute() {
	const navigate = useNavigate();
	return <ObjectsView onBack={() => navigate('/')} />;
}

function ClassesRoute() {
	const navigate = useNavigate();
	return <ClassesView onBack={() => navigate('/')} />;
}

function CharactersRoute() {
	const navigate = useNavigate();
	return <CharactersView onBack={() => navigate('/')} onOpenCharacter={(id) => navigate(`/characters/${id}`)} />;
}

function CharacterDetailRoute() {
	const navigate = useNavigate();
	const params = useParams();
	const characterId = Number(params.id);

	if (!Number.isFinite(characterId) || characterId <= 0) return <Navigate to="/characters" />;
	return <CharacterDetail characterId={characterId} onBack={() => navigate('/characters')} />;
}

function ComponentsRoute() {
	const navigate = useNavigate();
	return <ComponentsView onBack={() => navigate('/')} />;
}

function ResourcesRoute() {
	const navigate = useNavigate();
	return <ResourcesView onBack={() => navigate('/')} />;
}

function SoundsRoute() {
	const navigate = useNavigate();
	return <SoundsView onBack={() => navigate('/')} />;
}

function RacesRoute() {
	const navigate = useNavigate();
	return <RacesView onBack={() => navigate('/')} />;
}

function CampaignDetailRoute() {
	const navigate = useNavigate();
	const params = useParams();
	const campaignId = Number(params.id);

	if (!Number.isFinite(campaignId)) {
		return (
			<div className="panel panel-corners-soft block-border block-panel-border">
				<div className="panel-header">
					<h1 style={{ margin: 0 }}>Campaña</h1>
				</div>
				<div style={{ padding: 12 }}>
					Id de campaña inválido.
					<div style={{ marginTop: 12 }}>
						<button onClick={() => navigate('/')}>Volver</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<CampaignDetail
			campaignId={campaignId}
			onBack={() => navigate('/')}
			onOpenChapterEvents={(chapterId) => navigate(`/campaigns/${campaignId}/chapters/${chapterId}/events`)}
		/>
	);
}

function ChapterEventsRoute() {
	const navigate = useNavigate();
	const params = useParams();
	const campaignId = Number(params.campaignId);
	const chapterId = Number(params.chapterId);

	if (!Number.isFinite(campaignId) || !Number.isFinite(chapterId)) {
		return (
			<div className="panel panel-corners-soft block-border block-panel-border">
				<div className="panel-header">
					<h1 style={{ margin: 0 }}>Eventos</h1>
				</div>
				<div style={{ padding: 12 }}>
					Parámetros inválidos.
					<div style={{ marginTop: 12 }}>
						<button onClick={() => navigate(`/campaigns/${campaignId}`)}>Volver</button>
					</div>
				</div>
			</div>
		);
	}

	return <ChapterEventsView chapterId={chapterId} onBack={() => navigate(`/campaigns/${campaignId}`)} />;
}

function App() {
	useLayoutEffect(() => {
		function applyTooltipToElement(el: HTMLElement) {
			const title = el.getAttribute('title');
			if (!title) return;
			// Solo convertir si no hay tooltip explícito.
			if (!el.getAttribute('data-tooltip')) el.setAttribute('data-tooltip', title);
			el.removeAttribute('title');
		}

		function applyTooltips(root: ParentNode) {
			if (root instanceof HTMLElement) applyTooltipToElement(root);
			const nodes = Array.from(root.querySelectorAll('[title]')) as HTMLElement[];
			for (const el of nodes) applyTooltipToElement(el);
		}

		function autosizeTextarea(el: HTMLTextAreaElement) {
			el.style.height = 'auto';
			el.style.height = `${el.scrollHeight + 2}px`;
		}

		function applyAutosize(root: ParentNode) {
			const nodes = Array.from(root.querySelectorAll('textarea')) as HTMLTextAreaElement[];
			for (const ta of nodes) autosizeTextarea(ta);
		}

		applyTooltips(document);
		applyAutosize(document);

		let tooltipEl: HTMLDivElement | null = null;
		let currentTarget: HTMLElement | null = null;

		function ensureTooltipEl() {
			if (tooltipEl) return tooltipEl;
			tooltipEl = document.createElement('div');
			tooltipEl.className = 'cp-tooltip';
			tooltipEl.setAttribute('role', 'tooltip');
			document.body.appendChild(tooltipEl);
			return tooltipEl;
		}

		function positionTooltip() {
			if (!tooltipEl || !currentTarget) return;
			const rect = currentTarget.getBoundingClientRect();
			const x = rect.left + rect.width / 2;
			const y = rect.top - 10;
			tooltipEl.style.left = `${x}px`;
			tooltipEl.style.top = `${y}px`;
			const tipRect = tooltipEl.getBoundingClientRect();
			const margin = 8;
			if (tipRect.left < margin) tooltipEl.style.left = `${x + (margin - tipRect.left)}px`;
			if (tipRect.right > window.innerWidth - margin) tooltipEl.style.left = `${x - (tipRect.right - (window.innerWidth - margin))}px`;
		}

		function showTooltip(target: HTMLElement) {
			const text = (target.getAttribute('data-tooltip') || '').trim();
			if (!text) return;
			currentTarget = target;
			const el = ensureTooltipEl();
			el.textContent = text;
			el.style.display = 'block';
			positionTooltip();
			requestAnimationFrame(() => {
				if (!tooltipEl) return;
				tooltipEl.classList.add('cp-tooltip--visible');
				positionTooltip();
			});
		}

		function hideTooltip() {
			currentTarget = null;
			if (!tooltipEl) return;
			tooltipEl.classList.remove('cp-tooltip--visible');
			window.setTimeout(() => {
				if (!tooltipEl) return;
				if (currentTarget) return;
				tooltipEl.style.display = 'none';
			}, 80);
		}

		function closestTooltipTarget(node: EventTarget | null): HTMLElement | null {
			if (!(node instanceof HTMLElement)) return null;
			return node.closest('[data-tooltip]') as HTMLElement | null;
		}

		function onPointerOver(e: Event) {
			const nextTarget = closestTooltipTarget(e.target);
			if (!nextTarget) return;
			if (currentTarget === nextTarget) return;
			showTooltip(nextTarget);
		}

		function onPointerOut(e: MouseEvent) {
			if (!currentTarget) return;
			const related = e.relatedTarget as any;
			if (related instanceof Node && currentTarget.contains(related)) return;
			hideTooltip();
		}

		function onFocusIn(e: Event) {
			const nextTarget = closestTooltipTarget(e.target);
			if (!nextTarget) return;
			showTooltip(nextTarget);
		}

		function onFocusOut() {
			hideTooltip();
		}

		function onInput(e: Event) {
			if (e.target instanceof HTMLTextAreaElement) autosizeTextarea(e.target);
		}

		const observer = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.type === 'attributes' && m.attributeName === 'title' && m.target instanceof HTMLElement) {
					applyTooltips(m.target);
				}
				if (m.type === 'childList') {
					for (const node of Array.from(m.addedNodes)) {
						if (!(node instanceof HTMLElement)) continue;
						applyTooltips(node);
						applyAutosize(node);
					}
				}
			}
		});

		if (document.body) {
			observer.observe(document.body, {
				subtree: true,
				childList: true,
				attributes: true,
				attributeFilter: ['title'],
			});
		}

		document.addEventListener('pointerover', onPointerOver, true);
		document.addEventListener('pointerout', onPointerOut as any, true);
		document.addEventListener('focusin', onFocusIn, true);
		document.addEventListener('focusout', onFocusOut, true);
		document.addEventListener('input', onInput, true);
		window.addEventListener('scroll', positionTooltip, true);
		window.addEventListener('resize', positionTooltip);

		return () => {
			observer.disconnect();
			document.removeEventListener('pointerover', onPointerOver, true);
			document.removeEventListener('pointerout', onPointerOut as any, true);
			document.removeEventListener('focusin', onFocusIn, true);
			document.removeEventListener('focusout', onFocusOut, true);
			document.removeEventListener('input', onInput, true);
			window.removeEventListener('scroll', positionTooltip, true);
			window.removeEventListener('resize', positionTooltip);
			if (tooltipEl) {
				tooltipEl.remove();
				tooltipEl = null;
			}
		};
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<SagaPanelRoute />} />
				<Route path="/campaigns/:id" element={<CampaignDetailRoute />} />
				<Route path="/campaigns/:campaignId/chapters/:chapterId/events" element={<ChapterEventsRoute />} />
				<Route path="/maps" element={<MapsRoute />} />
				<Route path="/mechanics" element={<MechanicsRoute />} />
				<Route path="/factions" element={<FactionsRoute />} />
				<Route path="/factions/:id" element={<FactionDetailRoute />} />
				<Route path="/professions" element={<ProfessionsRoute />} />
				<Route path="/professions/:id" element={<ProfessionDetailRoute />} />
				<Route path="/objects" element={<ObjectsRoute />} />
				<Route path="/classes" element={<ClassesRoute />} />
				<Route path="/characters" element={<CharactersRoute />} />
				<Route path="/characters/:id" element={<CharacterDetailRoute />} />
				<Route path="/components" element={<ComponentsRoute />} />
				<Route path="/resources" element={<ResourcesRoute />} />
				<Route path="/sounds" element={<SoundsRoute />} />
				<Route path="/races" element={<RacesRoute />} />
				<Route path="/maps/:id" element={<MapDetailRoute />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;