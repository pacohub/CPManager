import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaCompass, FaCubes, FaMountain, FaFlag, FaUser, FaPaw } from 'react-icons/fa';
import { FaCogs, FaVolumeUp, FaRunning, FaShieldAlt } from 'react-icons/fa';
import { GiArmorUpgrade, GiChest, GiCrossedSwords, GiWarPick } from 'react-icons/gi';

const GlobalMenu: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="panel-sticky-header">
			<div className="panel-header" style={{ justifyContent: 'center' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
						<button className="icon" aria-label="Saga" data-tooltip="Saga" onClick={() => navigate('/')}>
							<FaBook size={26} color="#FFD700" />
						</button>
					<button className="icon" aria-label="Mapas" data-tooltip="Mapas" onClick={() => navigate('/maps')}>
						<FaCompass size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Componentes" data-tooltip="Componentes" onClick={() => navigate('/components')}>
						<FaCubes size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Mecánicas" data-tooltip="Mecánicas" onClick={() => navigate('/mechanics')}>
						<FaCogs size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Profesiones" data-tooltip="Profesiones" onClick={() => navigate('/professions')}>
						<GiWarPick size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Recursos" data-tooltip="Recursos" onClick={() => navigate('/resources')}>
						<FaMountain size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Objetos" data-tooltip="Objetos" onClick={() => navigate('/objects')}>
						<GiChest size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Facciones" data-tooltip="Facciones" onClick={() => navigate('/factions')}>
						<FaFlag size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Personajes" data-tooltip="Personajes" onClick={() => navigate('/characters')}>
						<FaUser size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Clases" data-tooltip="Clases" onClick={() => navigate('/classes')}>
						<GiCrossedSwords size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Razas" data-tooltip="Razas" onClick={() => navigate('/races')}>
						<FaPaw size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Tipos de armadura" data-tooltip="Tipos de armadura" onClick={() => navigate('/armor-types')}>
						<GiArmorUpgrade size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Tipos de defensa" data-tooltip="Tipos de defensa" onClick={() => navigate('/defense-types')}>
						<FaShieldAlt size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Animaciones" data-tooltip="Animaciones" onClick={() => navigate('/animations')}>
						<FaRunning size={26} color="#FFD700" />
					</button>
					<button className="icon" aria-label="Sonidos" data-tooltip="Sonidos" onClick={() => navigate('/sounds')}>
						<FaVolumeUp size={26} color="#FFD700" />
					</button>
				</div>
			</div>
		</div>
	);
};

export default GlobalMenu;
