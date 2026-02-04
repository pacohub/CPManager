import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DevModeContextType {
	devMode: boolean;
	toggleDevMode: () => void;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export const useDevMode = () => {
	const context = useContext(DevModeContext);
	if (!context) throw new Error('useDevMode must be used within a DevModeProvider');
	return context;
};

export const DevModeProvider = ({ children }: { children: ReactNode }) => {
	const [devMode, setDevMode] = useState(false);
	const toggleDevMode = () => setDevMode((prev) => !prev);
	return (
		<DevModeContext.Provider value={{ devMode, toggleDevMode }}>
			{children}
		</DevModeContext.Provider>
	);
};
