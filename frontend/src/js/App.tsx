
import React from 'react';
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

function SagaPanelRoute() {
	const navigate = useNavigate();
	return (
		<SagaPanel
			onOpenCampaign={(id) => navigate(`/campaigns/${id}`)}
			onOpenMaps={() => navigate('/maps')}
			onOpenMechanics={() => navigate('/mechanics')}
			onOpenFactions={() => navigate('/factions')}
			onOpenClasses={() => navigate('/classes')}
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

function ComponentsRoute() {
	const navigate = useNavigate();
	return <ComponentsView onBack={() => navigate('/')} />;
}

function ResourcesRoute() {
	const navigate = useNavigate();
	return <ResourcesView onBack={() => navigate('/')} />;
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
				<Route path="/components" element={<ComponentsRoute />} />
				<Route path="/resources" element={<ResourcesRoute />} />
				<Route path="/maps/:id" element={<MapDetailRoute />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;