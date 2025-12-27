export type Wc3PlayerColor = {
	id: number;
	name: string;
	hex: string;
};

// Warcraft III (Reforged / 1.32+) player colors (1-24)
export const WC3_PLAYER_COLORS: Wc3PlayerColor[] = [
	{ id: 1, name: 'Rojo', hex: '#FF0303' },
	{ id: 2, name: 'Azul', hex: '#0042FF' },
	{ id: 3, name: 'Verde azulado', hex: '#1CE6B9' },
	{ id: 4, name: 'Morado', hex: '#540081' },
	{ id: 5, name: 'Amarillo', hex: '#FFFC00' },
	{ id: 6, name: 'Naranja', hex: '#FE8A0E' },
	{ id: 7, name: 'Verde', hex: '#20C000' },
	{ id: 8, name: 'Rosa', hex: '#E55BB0' },
	{ id: 9, name: 'Gris claro', hex: '#959697' },
	{ id: 10, name: 'Azul claro', hex: '#7EBFF1' },
	{ id: 11, name: 'Verde oscuro', hex: '#106246' },
	{ id: 12, name: 'Marrón', hex: '#4E2A04' },
	{ id: 13, name: 'Granate', hex: '#9B0000' },
	{ id: 14, name: 'Azul marino', hex: '#0000C3' },
	{ id: 15, name: 'Turquesa', hex: '#00EAFF' },
	{ id: 16, name: 'Violeta', hex: '#BE00FE' },
	{ id: 17, name: 'Trigo', hex: '#EBCD87' },
	{ id: 18, name: 'Melocotón', hex: '#F8A48B' },
	{ id: 19, name: 'Menta', hex: '#BFFF80' },
	{ id: 20, name: 'Lavanda', hex: '#DCB9EB' },
	{ id: 21, name: 'Carbón', hex: '#282828' },
	{ id: 22, name: 'Nieve', hex: '#EBF0FF' },
	{ id: 23, name: 'Esmeralda', hex: '#00781E' },
	{ id: 24, name: 'Cacahuete', hex: '#A46F33' },
];
