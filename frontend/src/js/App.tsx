
import React from 'react';
import { BrowserRouter, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import SagaPanel from './SagaPanel';
import CampaignDetail from './CampaignDetail';
import MapsView from './MapsView';
import MechanicsView from './MechanicsView';
import FactionsView from './FactionsView';
import ChapterEventsView from './ChapterEventsView';

function SagaPanelRoute() {
	const navigate = useNavigate();
	return (
		<SagaPanel
			onOpenCampaign={(id) => navigate(`/campaigns/${id}`)}
			onOpenMaps={() => navigate('/maps')}
			onOpenMechanics={() => navigate('/mechanics')}
			onOpenFactions={() => navigate('/factions')}
		/>
	);
}

function MapsRoute() {
	const navigate = useNavigate();
	return <MapsView onBack={() => navigate('/')} />;
}

function MechanicsRoute() {
	const navigate = useNavigate();
	return <MechanicsView onBack={() => navigate('/')} />;
}

function FactionsRoute() {
	const navigate = useNavigate();
	return <FactionsView onBack={() => navigate('/')} />;
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
			</Routes>
		</BrowserRouter>
	);
}

export default App;